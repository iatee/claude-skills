---
title: Power user
description: Chain skills into workflows, pick the right one among look-alikes, write your own skills, and understand hooks and plugins.
---

Single skills help. Skills chained into a workflow change how you work. This guide is for people who already use Claude Code daily and want more out of it.

## Workflows

The workflows below are adapted from Matt Pocock's `ask-matt` guide in [mattpocock/skills](https://github.com/mattpocock/skills), with credit to him.

### The main flow: idea to shipped code

Most work follows one path. You have an idea and want it built.

1. **`/grill-with-docs`** sharpens the idea by interviewing you. It records what it learns in `CONTEXT.md` and decision records, so the reasoning survives. Outside a project, use **`/grill-me`**, which asks the same questions but writes nothing down.
2. **Is it bigger than one session?**
   - **Yes:** **`/to-spec`** turns the conversation into a spec, then **`/to-tickets`** splits it into small tickets that each say which other tickets they wait on. Then, for each ticket: **`/implement`**, then `/clear` before the next. Each ticket stands on its own, so the old context is disposable.
   - **No:** **`/implement`** right away, in the same conversation.
3. **`/implement`** builds test-first using **`tdd`**, then reviews its own work with **`coding:code-review`** before committing.

Run `/setup-matt-pocock-skills` once per repository first. It tells the planning skills where your issue tracker and docs live; a local folder of Markdown files works fine.

**Keep steps 1 and 2 in one unbroken conversation.** The grilling, the spec and the tickets should all build on the same thinking, so don't `/clear` until the tickets exist. If the conversation gets very long before then, use `/handoff` at a natural break and continue in a fresh session.

### Side entrances

Some work doesn't start with an idea:

- **Something is broken:** **`diagnosing-bugs`**. It refuses to guess until it has one command that reliably shows the bug, then fixes it and adds a test so it stays fixed. If the real problem turns out to be messy code, it points you to **`/improve-codebase-architecture`**.
- **Issues are piling up:** **`/triage`** sorts reports from other people into briefs an agent can act on. Then `/implement` them. Don't triage tickets that `/to-tickets` made; they're already ready.
- **A huge, foggy project:** **`/wayfinder`**. When you can't see the way from here to the goal, it maps the open decisions as tickets and settles them one by one. It's slow and thorough, so save it for work too big for one grilling session.

### Smaller loops

- **A decision, not a build:** `/council` has seven expert personas argue it out and gives you a verdict with risks. Use `/grill-me` when the plan is yours to sharpen, and `/council` when you want outside perspectives on a choice.
- **Frontend polish:** build the page, then `/impeccable critique` for an honest review, then `/impeccable polish`. When the result looks generic, `taste-skill` gives it a deliberate visual direction first.
- **End of a work session:** `/retro` to capture lessons, then `/handoff` (a file for later) or `/claude-handoff` (a background agent that carries on now).
- **Lost the thread:** `/wait-what` makes Claude re-explain its last message plainly.

## Choosing between look-alikes

| If you're torn between… | Use… |
|---|---|
| `grill-me` and `grill-with-docs` | `grill-with-docs` inside a project (it keeps notes), `grill-me` anywhere else |
| `grill-me` and `council` | `grill-me` to sharpen your own plan, `council` to weigh a choice from many angles |
| `implement` and `implement-spec` | `implement` for one ticket at a time, `implement-spec` to build a whole spec in parallel and open one pull request |
| `/code-review` and `/coding:code-review` | `/coding:code-review` checks your repo's standards *and* the spec. Plain `/code-review` is Claude Code's built-in bug hunt. Both are useful. |
| `handoff` and `claude-handoff` | `handoff` writes a file for you to continue later; `claude-handoff` starts a background agent immediately |
| `impeccable` and `taste-skill` | `taste-skill` to choose a visual direction, `impeccable` to critique and refine what exists |
| `diagnosing-bugs` and `tdd` | `diagnosing-bugs` when something's broken and you don't know why; `tdd` when you're building something new |

## Write your own skill

A skill is a folder with a `SKILL.md` file in it. Put it in `~/.claude/skills/<name>/` to use it in every project, or in `.claude/skills/<name>/` inside a project to share it with that project's team.

```markdown
---
name: release-notes
description: Write release notes from the commits since the last tag. Use when the user asks for release notes, a changelog entry, or "what changed since the last release".
---

1. Find the latest tag with `git describe --tags --abbrev=0`.
2. Read the commits since then.
3. Group them under **New**, **Improved** and **Fixed**. Leave out internal changes.
4. Write one plain sentence per change, for users rather than developers.
```

The parts that matter:

- **`description` decides when the skill is used.** Claude only sees the description until the skill is needed. Say what it does, then "Use when…" with the words people actually type. A vague description means a skill that never fires.
- **`disable-model-invocation: true`** makes it a command skill that only runs when you type it. Use this for anything long, expensive, or with side effects.
- **Keep `SKILL.md` short.** Put long reference material in separate files next to it and tell Claude when to read them. It only loads what it needs.
- **Write instructions, not explanations.** Claude doesn't need to be convinced; it needs to know what to do, in order.

**Get help writing it:** `writing-for-agents` loads automatically when you write a skill and applies what works. If you install `observer`, `task-observer` also collects ideas for new skills while you work.

**Make the suggester know it:** the suggester reads your skill's description automatically. If people describe the job in words your description doesn't use, add them in `~/.claude/skill-suggester/settings.json`:

```json
{ "triggers": { "release-notes": ["changelog", "what's new", "ship notes"] } }
```

The same file takes `"heavy": [...]`, a list of skill names the suggester should always offer to you rather than leave to Claude.

## Hooks and plugins, briefly

**Hooks** run a command of your own when something happens in Claude Code: a session starts, you send a message, Claude edits a file. They're how you make things happen *every* time rather than hoping Claude remembers. The suggester is a hook: on every message it runs a small script that checks your skills. Hooks are set up in `settings.json`; ask Claude to "add a hook that…" and it'll write one, or read Anthropic's [hooks guide](https://code.claude.com/docs/en/hooks).

**Plugins** bundle skills, hooks and other add-ons so they install as one unit. **Marketplaces** list plugins. This repository is both: each folder under `plugins/` is a plugin, and `.claude-plugin/marketplace.json` lists them. A marketplace can also point at plugins in other people's repositories, which is how `taste-skill`, `searchfit-seo` and `ponytail` are included without copying them.

To build your own, run `claude plugin init my-plugin` in your terminal, or read Anthropic's [plugin docs](https://code.claude.com/docs/en/plugins).

**Mods** go one step further: plugins whose code runs inside Claude Code and can draw panes, restyle the interface and step into tool calls. [Customize Claude Code](customize.md) covers mods, status bars and memory, and [Your own Claude server](own-server.md) shows how to run Claude Code on an always-on machine.

## Further resources

- **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md):** `DESIGN.md` files describing the design systems of well-known brands. Drop one into a project and `impeccable`, which reads `DESIGN.md`, will design in that style.
- **[graphify](https://github.com/Graphify-Labs/graphify):** turns a codebase, its docs and schemas into a knowledge graph Claude can query. Useful for large, unfamiliar projects. It installs its own skill: with Python 3.10+, run `uv tool install graphifyy` (or `pipx install graphifyy`), then `graphify install`.
- **[mattpocock/skills](https://github.com/mattpocock/skills):** the source of most skills here, with more experimental ones.
- **Anthropic's [best practices](https://code.claude.com/docs/en/best-practices):** the official guide to getting good results.
