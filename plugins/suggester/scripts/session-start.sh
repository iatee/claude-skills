#!/bin/sh
# Forget which skills were suggested in sessions older than 30 days.
find "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skill-suggester/sessions" -name '*.json' -mtime +30 -delete 2>/dev/null
# Tell the user once per session when Node.js is missing, since the suggester runs on it.
command -v node >/dev/null 2>&1 && exit 0
echo '{"systemMessage": "Skill suggester is off: it needs Node.js 18 or later. Install it from https://nodejs.org, see https://skills.garciabaertsch.com"}'
