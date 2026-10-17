#!/bin/sh
# Match the prompt against installed skills. Without Node.js, or if the script fails, stay silent.
command -v node >/dev/null 2>&1 || exit 0
node "${CLAUDE_PLUGIN_ROOT}/scripts/suggest.mjs" || exit 0
