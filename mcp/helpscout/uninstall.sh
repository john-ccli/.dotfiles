#!/usr/bin/env bash
# Removes the helpscout MCP using each tool's own CLI where one exists.
set -uo pipefail

NAME=helpscout

if command -v claude >/dev/null; then
  claude mcp remove "$NAME" --scope user
fi

if command -v copilot >/dev/null; then
  copilot mcp remove "$NAME"
fi

# These CLIs have no remove command
cat <<MSG

Remove manually:
  opencode: delete the "$NAME" entry under "mcp" in ~/.config/opencode/opencode.jsonc
  vscode:   run "MCP: List Servers" > $NAME > Uninstall (or edit the User mcp.json)
MSG
