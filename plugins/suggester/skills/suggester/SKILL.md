---
name: suggester
description: Turn the skill suggester on or off. Run as `/suggester off` or `/suggester on`.
argument-hint: "on | off"
disable-model-invocation: true
---

The suggester's hook has already applied the user's `on` or `off` before you read this. Confirm it in one sentence:

- **off**: "Skill suggestions are off. Turn them back on with `/suggester on`."
- **on**: "Skill suggestions are on. I'll mention a skill only when it clearly fits."

If the user gave neither `on` nor `off`, explain those two options in one sentence.

The setting is stored in `~/.claude/skill-suggester/settings.json` (`"enabled": true|false`). That file also takes:

- `"heavy"`: skill names that should only ever be suggested, never auto-used.
- `"triggers"`: extra words per skill name, e.g. `{"tdd": ["kata"]}`.

Edit it only if the user asks to change those.
