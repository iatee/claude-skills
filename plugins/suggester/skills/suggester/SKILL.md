---
name: suggester
description: Turn the skill suggester on or off, or run the remembered plan. Run as `/suggester off`, `/suggester on` or `/suggester plan`.
argument-hint: "on | off | plan"
disable-model-invocation: true
---

The suggester's hook has already applied the user's `on` or `off` before you read this. Confirm it in one sentence:

- **off**: "Skill suggestions are off. Turn them back on with `/suggester on`."
- **on**: "Skill suggestions are on. I'll mention a skill only when it clearly fits."

- **plan**: the hook has given you the remembered plan's remaining steps and how to run them. Follow that note. If there is no note, say that no plan is remembered for this project.

If the user gave none of these, explain the three options in one sentence.

The setting is stored in `~/.claude/skill-suggester/settings.json` (`"enabled": true|false`). That file also takes:

- `"heavy"`: skill names that should only ever be suggested, never auto-used.
- `"triggers"`: extra words per skill name, e.g. `{"tdd": ["kata"]}`.

Edit it only if the user asks to change those.
