#!/usr/bin/env node
/**
 * Minimal HelpScout Mailbox API v2 MCP for triage.
 *
 * Read conversations, and add internal notes when HELPSCOUT_ENABLE_NOTES=1 (off by
 * default). There is deliberately no tool that replies to, emails or otherwise
 * contacts a customer.
 *
 * Output is shaped to keep customer details out: no customer or team names,
 * emails, cc/bcc or custom fields, and email addresses and phone numbers in
 * message text are masked. Names, church names and license numbers inside
 * message text are not, so callers must still redact before copying text on.
 *
 * Credentials: HELPSCOUT_APP_ID and HELPSCOUT_SECRET, from the environment or
 * from `.env` next to this file (override the path with HELPSCOUT_ENV_FILE).
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const here = dirname(fileURLToPath(import.meta.url));
const envFile = process.env.HELPSCOUT_ENV_FILE ?? resolve(here, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const API = (process.env.HELPSCOUT_API_BASE ?? 'https://api.helpscout.net').replace(/\/$/, '');
const WEB = 'https://secure.helpscout.net';

let token = null;

async function getToken(force = false) {
  if (token && !force && Date.now() < token.expiresAt) return token.value;
  const id = process.env.HELPSCOUT_APP_ID;
  const secret = process.env.HELPSCOUT_SECRET;
  if (!id || !secret) {
    throw new Error(`HelpScout credentials missing: set HELPSCOUT_APP_ID and HELPSCOUT_SECRET in ${envFile}.`);
  }
  const res = await fetch(`${API}/v2/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
  });
  if (!res.ok) throw new Error(`HelpScout token request failed: HTTP ${res.status}. Check the app ID and secret.`);
  const body = await res.json();
  token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in - 300) * 1000 };
  return token.value;
}

/** Calls the API, refreshing the token once on 401 and waiting once on 429. */
async function api(method, path, { query, body } = {}, retried = { auth: false, rate: false }) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${await getToken(retried.auth)}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && !retried.auth) return api(method, path, { query, body }, { ...retried, auth: true });
  if (res.status === 429 && !retried.rate) {
    const wait = Math.min(Number(res.headers.get('retry-after')) || 5, 60);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return api(method, path, { query, body }, { ...retried, rate: true });
  }
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`HelpScout ${method} ${url.pathname} failed: HTTP ${res.status}${detail ? ` ${detail}` : ''}`);
  }
  return res.status === 204 || method !== 'GET' ? res : res.json();
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function htmlToText(html = '') {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h\d|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
      if (e[0] !== '#') return ENTITIES[e.toLowerCase()] ?? m;
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Masks emails and phone numbers, leaving digits inside URLs alone. */
function mask(text = '') {
  return text
    .split(/(https?:\/\/[^\s<>"]+)/)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
            .replace(/(?<![\w#])\+?\(?\d[\d\s().-]{7,}\d(?!\w)/g, (m) => (m.replace(/\D/g, '').length >= 10 ? '[phone]' : m)),
    )
    .join('');
}

const link = (c) => `${WEB}/conversation/${c.id}/${c.number}`;

function summary(c) {
  return {
    id: c.id,
    number: c.number,
    url: link(c),
    subject: mask(c.subject),
    status: c.status,
    mailboxId: c.mailboxId,
    createdAt: c.createdAt,
    modifiedAt: c.userUpdatedAt,
    closedAt: c.closedAt,
    tags: (c.tags ?? []).map((t) => t.tag),
    preview: mask(c.preview),
  };
}

const AUTHOR = { customer: 'customer', user: 'team' };

function thread(t) {
  return {
    id: t.id,
    type: t.type,
    from: AUTHOR[t.createdBy?.type] ?? t.createdBy?.type ?? 'system',
    createdAt: t.createdAt,
    text: mask(htmlToText(t.body)),
    attachments: (t._embedded?.attachments ?? []).map((a) => ({ filename: a.filename, mimeType: a.mimeType, size: a.size })),
  };
}

async function findByNumber(number) {
  const res = await api('GET', '/v2/conversations', { query: { number, status: 'all' } });
  const hit = res._embedded?.conversations?.find((c) => c.number === number);
  if (!hit) throw new Error(`No HelpScout conversation #${number}.`);
  return hit.id;
}

/** Accepts a conversation ID, a `#number`, or a secure.helpscout.net conversation URL. */
async function resolveId(ref) {
  const s = String(ref).trim();
  const url = s.match(/helpscout\.net\/conversation\/(\d+)/);
  if (url) return Number(url[1]);
  if (/^#\d+$/.test(s)) return findByNumber(Number(s.slice(1)));
  if (/^\d+$/.test(s)) return Number(s);
  throw new Error(`Not a HelpScout conversation reference: ${s}`);
}

const json = (value) => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });

const server = new McpServer({ name: 'helpscout', version: '1.0.0' });

server.registerTool(
  'get_conversation',
  {
    title: 'Get HelpScout conversation',
    description:
      'Get one HelpScout conversation with its threads (oldest first) as plain text. Customer and team names, emails and phone numbers are removed, but message text can still contain names, church names or license numbers: redact before copying any of it elsewhere. Attachments are listed by file name only.',
    inputSchema: {
      conversation: z
        .string()
        .describe('Conversation ID (e.g. "2934567812"), number with a leading # (e.g. "#1896937"), or its secure.helpscout.net URL'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ conversation }) => {
    const id = await resolveId(conversation);
    const c = await api('GET', `/v2/conversations/${id}`, { query: { embed: 'threads' } });
    const threads = (c._embedded?.threads ?? []).map(thread).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return json({ ...summary(c), threads });
  },
);

server.registerTool(
  'list_conversations',
  {
    title: 'List HelpScout conversations',
    description:
      'List HelpScout conversations, most recently modified first, 25 per page. Returns summaries (subject, status, tags, a short preview), not threads; use get_conversation for those.',
    inputSchema: {
      modifiedSince: z.string().optional().describe('ISO 8601 timestamp, e.g. "2026-11-17T00:00:00Z". Only conversations modified after it.'),
      status: z.enum(['active', 'pending', 'closed', 'open', 'spam', 'all']).default('all'),
      mailbox: z.string().optional().describe('Mailbox ID, or several comma-separated. See list_mailboxes.'),
      tag: z.string().optional().describe('Tag, or several comma-separated'),
      query: z.string().optional().describe('HelpScout search syntax, e.g. "(subject:\\"chordpro\\")" or "(body:\\"save\\")"'),
      page: z.number().int().min(1).default(1),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ modifiedSince, status, mailbox, tag, query, page }) => {
    if (modifiedSince && Number.isNaN(Date.parse(modifiedSince))) throw new Error(`Invalid modifiedSince: ${modifiedSince}`);
    const res = await api('GET', '/v2/conversations', {
      query: {
        status,
        mailbox,
        tag,
        query,
        page,
        modifiedSince: modifiedSince && new Date(modifiedSince).toISOString().replace(/\.\d{3}Z$/, 'Z'),
        sortField: 'modifiedAt',
        sortOrder: 'desc',
      },
    });
    return json({ page: res.page, conversations: (res._embedded?.conversations ?? []).map(summary) });
  },
);

server.registerTool(
  'list_mailboxes',
  {
    title: 'List HelpScout mailboxes',
    description: 'List HelpScout mailbox IDs and names, for filtering list_conversations by product.',
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async () => {
    const res = await api('GET', '/v2/mailboxes');
    return json((res._embedded?.mailboxes ?? []).map((m) => ({ id: m.id, name: m.name })));
  },
);

if (process.env.HELPSCOUT_ENABLE_NOTES === '1') server.registerTool(
  'add_internal_note',
  {
    title: 'Add HelpScout internal note',
    description:
      'Add an internal note (visible to the support team only, never sent to the customer) to a HelpScout conversation. The conversation status is left unchanged. Only call this after the user has approved the exact note text.',
    inputSchema: {
      conversation: z.string().describe('Conversation ID, #number, or its secure.helpscout.net URL'),
      text: z.string().trim().min(1).describe('Plain text; line breaks are kept'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  async ({ conversation, text }) => {
    const id = await resolveId(conversation);
    const c = await api('GET', `/v2/conversations/${id}`);
    const html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    const res = await api('POST', `/v2/conversations/${id}/notes`, { body: { text: html, status: c.status } });
    return json({ noteId: res.headers.get('resource-id'), conversation: { id: c.id, number: c.number, url: link(c), status: c.status } });
  },
);

await server.connect(new StdioServerTransport());
