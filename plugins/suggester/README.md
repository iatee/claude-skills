# suggester

Claude Code has more skills than anyone remembers. The suggester reads each prompt you send and compares it with the skills you have installed. When one clearly fits, it tells Claude. If the skill is one that only you can start, Claude adds a single line to its reply:

> 💡 `/planning:grill-me` could help here: it interviews you until the plan has no gaps.

If Claude is allowed to use the skill on its own, it may simply use it. The suggester never starts a skill that you have to run yourself. It stays quiet when nothing fits, mentions each skill at most once per conversation, and works with every skill you have installed, from any plugin or marketplace.

Part of [Claude Skills](https://skills.garciabaertsch.com), an unofficial, personal collection. Not affiliated with or endorsed by Anthropic.

## Install

In Claude Code:

```
/plugin install suggester --marketplace iatee/claude-skills
```

Then run `/reload-plugins`.

## Examples

- You write "I want to plan a newsletter about home gardening, help me think it through". With `grill-me` installed, Claude adds a 💡 line suggesting it.
- You write "this test keeps failing every few runs and I have no idea why". With a debugging skill such as `diagnosing-bugs` installed, Claude is pointed to it and can use it.
- You write "the landing page looks bland, can you make it look better". With a design skill such as `impeccable` installed, Claude is pointed to it and can use it.
- You write "what's the capital of Peru". No skill fits, so nothing is added.

## Commands

- `/suggester off` turns suggestions off.
- `/suggester on` turns them back on.

## Requirements

Node.js 18 or later. Without it, Claude Code shows a reminder when a session starts and the suggester does nothing else.

## What it runs, reads and writes

The plugin has two hooks, both shell scripts in `scripts/`:

- **SessionStart** (`session-start.sh`) checks whether `node` is available and, if not, shows the reminder above.
- **UserPromptSubmit** (`suggest.sh`) runs `scripts/suggest.mjs` with Node.js on each prompt. Prompts that start with `/` or have fewer than four words are skipped.

`suggest.mjs` and `index.mjs` only read and write local files. They make no network requests and send nothing anywhere. They read:

- the prompt and session ID that Claude Code passes to the hook;
- the current session's transcript, to skip skills you have already used;
- `~/.claude/plugins/installed_plugins.json` and `~/.claude/settings.json`, to find enabled plugins;
- the name and description in each installed skill's `SKILL.md`, in your user, project and plugin skill folders;
- `triggers.json` in this plugin, extra words that point to particular skills.

They write only inside `~/.claude/skill-suggester/` (or `$CLAUDE_CONFIG_DIR/skill-suggester/`): `settings.json` for your on/off setting and options, `index.json` as a cache of skill descriptions, and one small file per session listing the skills already suggested.

When a skill fits, the hook adds a short note to Claude's context naming up to three candidate skills, with their descriptions. Skills that only you can start are marked "suggest to the user"; other skills are ones Claude may use on its own if it helps.

## Settings

`~/.claude/skill-suggester/settings.json` takes:

- `"enabled"`: `true` or `false`, set by `/suggester on` and `/suggester off`.
- `"heavy"`: skill names that should only ever be suggested, never used by Claude on its own.
- `"triggers"`: extra words per skill name, for example `{"tdd": ["kata"]}`.

## License

MIT. Source: [github.com/iatee/claude-skills](https://github.com/iatee/claude-skills/tree/main/plugins/suggester).
