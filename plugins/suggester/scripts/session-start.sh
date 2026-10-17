#!/bin/sh
# Forget which skills were suggested in sessions older than 30 days.
find "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skill-suggester/sessions" -name '*.json' -mtime +30 -delete 2>/dev/null
# Tell the user once per session when Node.js is missing, since the suggester runs on it.
if ! command -v node >/dev/null 2>&1; then
  echo '{"systemMessage": "Skill suggester is off: it needs Node.js 18 or later. Install it from https://nodejs.org, see https://skills.garciabaertsch.com"}'
  exit 0
fi
# Describe the milestones to Claude. If the script fails, stay silent.
node "${CLAUDE_PLUGIN_ROOT}/scripts/session-start.mjs" || exit 0
