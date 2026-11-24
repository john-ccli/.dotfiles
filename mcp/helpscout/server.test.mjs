import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const requests = [];
let tokenCalls = 0;
let failNextWith401 = false;

const conv = {
  id: 111,
  number: 42,
  subject: 'Save error from jane@example.com',
  status: 'pending',
  mailboxId: 7,
  createdAt: '2026-11-16T10:00:00Z',
  userUpdatedAt: '2026-11-17T10:00:00Z',
  tags: [{ id: 1, tag: 'planning' }],
  preview: 'Call me at (555) 123-4567 re https://example.com/help/thread/1234567890?page=1',
  primaryCustomer: { email: 'jane@example.com', first: 'Jane' },
  _embedded: {
    threads: [
      {
        id: 2,
        type: 'note',
        createdBy: { type: 'user', email: 'agent@example.com', first: 'Agent' },
        createdAt: '2026-11-17T09:00:00Z',
        body: '<p>Asked for a screenshot</p>',
      },
      {
        id: 1,
        type: 'customer',
        createdBy: { type: 'customer', email: 'jane@example.com', first: 'Jane' },
        createdAt: '2026-11-16T10:00:00Z',
        body: '<div>Song 2437367 won&#39;t save &amp; errors.<br>Email jane@example.com or +1 555 123 4567</div>',
        _embedded: { attachments: [{ filename: 'shot.png', mimeType: 'image/png', size: 1234, _links: {} }] },
      },
    ],
  },
};

const mock = createServer((req, res) => {
  let body = '';
  req.on('data', (d) => (body += d));
  req.on('end', () => {
    const url = new URL(req.url, 'http://x');
    requests.push({ method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), auth: req.headers.authorization, body });
    const send = (status, value, headers = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
      res.end(value === undefined ? '' : JSON.stringify(value));
    };
    if (url.pathname === '/v2/oauth2/token') {
      tokenCalls++;
      const p = new URLSearchParams(body);
      if (p.get('client_id') !== 'app' || p.get('client_secret') !== 'secret') return send(401, { error: 'bad' });
      return send(200, { access_token: `tok${tokenCalls}`, expires_in: 172800, token_type: 'bearer' });
    }
    if (failNextWith401) {
      failNextWith401 = false;
      return send(401, {});
    }
    if (url.pathname === '/v2/conversations' && req.method === 'GET') {
      const list = url.searchParams.get('number') === '42' || !url.searchParams.get('number') ? [conv] : [];
      return send(200, { _embedded: { conversations: list }, page: { size: 25, totalElements: list.length, totalPages: 1, number: 1 } });
    }
    if (url.pathname === '/v2/conversations/111' && req.method === 'GET') return send(200, conv);
    if (url.pathname === '/v2/conversations/111/notes' && req.method === 'POST') return send(201, undefined, { 'Resource-ID': '999' });
    if (url.pathname === '/v2/mailboxes') return send(200, { _embedded: { mailboxes: [{ id: 7, name: 'WorshipTools', email: 'x@y.z' }] } });
    send(404, { message: 'not found' });
  });
});

let client;
let readOnlyClient;

async function connect(extraEnv = {}) {
  const c = new Client({ name: 'test', version: '0' });
  await c.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(new URL('./server.mjs', import.meta.url))],
      env: {
        PATH: process.env.PATH,
        HELPSCOUT_API_BASE: `http://127.0.0.1:${mock.address().port}`,
        HELPSCOUT_ENV_FILE: '/nonexistent',
        HELPSCOUT_APP_ID: 'app',
        HELPSCOUT_SECRET: 'secret',
        ...extraEnv,
      },
    }),
  );
  return c;
}

before(async () => {
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  client = await connect({ HELPSCOUT_ENABLE_NOTES: '1' });
  readOnlyClient = await connect();
});

after(async () => {
  await client?.close();
  await readOnlyClient?.close();
  mock.close();
});

const call = async (name, args = {}) => {
  const res = await client.callTool({ name, arguments: args });
  return { ...res, data: res.isError ? null : JSON.parse(res.content[0].text) };
};

test('is read-only by default', async () => {
  const { tools } = await readOnlyClient.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ['get_conversation', 'list_conversations', 'list_mailboxes']);
});

test('adds only the note tool when notes are enabled, none that reply', async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ['add_internal_note', 'get_conversation', 'list_conversations', 'list_mailboxes']);
});

test('get_conversation strips customer details and orders threads', async () => {
  const { data } = await call('get_conversation', { conversation: 'https://secure.helpscout.net/conversation/111/42?folderId=1' });
  const out = JSON.stringify(data);
  assert.ok(!out.includes('jane'), 'no customer email or name');
  assert.ok(!out.includes('Agent'), 'no team names');
  assert.equal(data.url, 'https://secure.helpscout.net/conversation/111/42');
  assert.deepEqual(data.threads.map((t) => t.from), ['customer', 'team']);
  assert.equal(data.threads[0].text, "Song 2437367 won't save & errors.\nEmail [email] or [phone]");
  assert.deepEqual(data.threads[0].attachments, [{ filename: 'shot.png', mimeType: 'image/png', size: 1234 }]);
  assert.equal(data.preview, 'Call me at [phone] re https://example.com/help/thread/1234567890?page=1');
});

test('get_conversation resolves #number', async () => {
  const { data } = await call('get_conversation', { conversation: '#42' });
  assert.equal(data.id, 111);
  const lookup = requests.find((r) => r.path === '/v2/conversations' && r.query.number === '42');
  assert.equal(lookup.query.status, 'all');
});

test('get_conversation reports an unknown number', async () => {
  const res = await call('get_conversation', { conversation: '#5' });
  assert.ok(res.isError);
  assert.match(res.content[0].text, /No HelpScout conversation #5/);
});

test('list_conversations sorts by modifiedAt and normalizes modifiedSince', async () => {
  requests.length = 0;
  const { data } = await call('list_conversations', { modifiedSince: '2026-11-17T00:00:00.000Z', mailbox: '7' });
  assert.equal(data.conversations[0].number, 42);
  assert.equal(data.conversations[0].subject, 'Save error from [email]');
  const q = requests.find((r) => r.path === '/v2/conversations').query;
  assert.deepEqual(q, { status: 'all', mailbox: '7', page: '1', modifiedSince: '2026-11-17T00:00:00Z', sortField: 'modifiedAt', sortOrder: 'desc' });
});

test('list_mailboxes returns id and name only', async () => {
  const { data } = await call('list_mailboxes');
  assert.deepEqual(data, [{ id: 7, name: 'WorshipTools' }]);
});

test('add_internal_note posts escaped text and keeps the status', async () => {
  requests.length = 0;
  const { data } = await call('add_internal_note', { conversation: '111', text: 'Filed WT-1 <bug>\nThanks' });
  assert.equal(data.noteId, '999');
  const post = requests.find((r) => r.method === 'POST' && r.path === '/v2/conversations/111/notes');
  assert.deepEqual(JSON.parse(post.body), { text: 'Filed WT-1 &lt;bug&gt;<br>Thanks', status: 'pending' });
});

test('add_internal_note rejects empty text', async () => {
  const res = await call('add_internal_note', { conversation: '111', text: '   ' });
  assert.ok(res.isError);
  assert.ok(!requests.some((r) => r.method === 'POST' && r.body === ''));
});

test('refreshes the token once on 401', async () => {
  const before = tokenCalls;
  failNextWith401 = true;
  const { data } = await call('list_mailboxes');
  assert.equal(data.length, 1);
  assert.equal(tokenCalls, before + 1);
});
