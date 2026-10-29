---
name: suggester
description: Turn the skill suggester on or off, run the remembered plan, or list your installed skills. Run as `/suggester off`, `/suggester on`, `/suggester plan` or `/suggester skills`.
argument-hint: "on | off | plan | skills"
disable-model-invocation: true
---

The suggester's hook has already applied the user's `on` or `off` before you read this. Confirm it in one sentence:

- **off**: "Skill suggestions are off. Turn them back on with `/suggester on`."
- **on**: "Skill suggestions are on. I'll mention a skill only when it clearly fits."

- **plan**: the hook has given you the remembered plan's remaining steps and how to run them. Follow that note. If there is no note, say that no plan is remembered for this project.

- **skills**: the hook has told you where the list of installed skills is and how to show it. Follow that note.

If the user gave none of these, explain the four options in one sentence.

The setting is stored in `~/.claude/skill-suggester/settings.json` (`"enabled": true|false`). That file also takes:

- `"heavy"`: skill names that should only ever be suggested, never auto-used.
- `"triggers"`: extra words per skill name, e.g. `{"tdd": ["kata"]}`.
- `"milestones"`: moments with skills to suggest then, e.g. before publishing a site; the format is in the plugin README.

Edit it only if the user asks to change those.
