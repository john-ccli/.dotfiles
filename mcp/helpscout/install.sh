#!/usr/bin/env bash
# Registers the helpscout MCP with Claude Code, Copilot CLI, OpenCode, and VS Code Copilot
# using each tool's own CLI. The server reads credentials from ./.env (see .env.example).
set -euo pipefail

NAME=helpscout
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER="$DIR/server.mjs"
ENV_FILE="$DIR/.env"
NODE="$(command -v node)" || { echo "node not found" >&2; exit 1; }

[[ -f "$ENV_FILE" ]] || echo "warning: $ENV_FILE missing; copy .env.example and fill it in" >&2
[[ -d "$DIR/node_modules" ]] || echo "warning: run 'npm install' in $DIR first" >&2

if command -v claude >/dev/null; then
  claude mcp remove "$NAME" --scope user >/dev/null 2>&1 || true
  claude mcp add --scope user "$NAME" -- "$NODE" "$SERVER"
else
  echo "skip: claude not found" >&2
fi

if command -v copilot >/dev/null; then
  copilot mcp remove "$NAME" >/dev/null 2>&1 || true
  copilot mcp add "$NAME" -- "$NODE" "$SERVER"
else
  echo "skip: copilot not found" >&2
fi

if command -v opencode >/dev/null; then
  # opencode has no remove command; re-running may fail if already registered
  opencode mcp add "$NAME" -- "$NODE" "$SERVER" \
    || echo "opencode: add failed (already registered? run ./uninstall.sh for removal steps)" >&2
else
  echo "skip: opencode not found" >&2
fi

if command -v code >/dev/null; then
  code --add-mcp "$(printf '{"name":"%s","command":"%s","args":["%s"]}' \
    "$NAME" "$NODE" "$SERVER")"
else
  echo "skip: code not found" >&2
fi
