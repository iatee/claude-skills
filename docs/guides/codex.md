---
title: Using these skills in Codex
description: Install this collection in OpenAI's Codex, start a skill there, and know which skills only work fully in Claude Code.
---

This collection is built for Claude Code, but most of it works in [Codex](https://developers.openai.com/codex) too. Skills are written in an open format, [Agent Skills](https://agentskills.io), that both tools read. What doesn't carry over are the parts that hook into Claude Code itself.

## Install

Codex has no command for adding a Claude Code marketplace, so use the [`skills`](https://github.com/vercel-labs/skills) installer instead. It needs [Node.js](https://nodejs.org). In a terminal, run:

```text
npx skills add iatee/claude-skills -g -a codex
```

It reads this collection's plugin list, asks which skills you want, and puts them in `~/.agents/skills`, where Codex looks for personal skills. `-g` makes them available in every project; leave it out to install into the current project's `.agents/skills` instead.

To install one skill without the questions:

```text
npx skills add iatee/claude-skills -g -a codex -s vibe-security
```

`npx skills add iatee/claude-skills --list` shows every skill you can pick. Restart Codex after installing so it picks the new skills up.

## Start a skill

- **Automatic:** Codex reads each skill's description and uses it when your request fits, the same as Claude Code. Ask "is my app safe to launch?" and `vibe-security` is used.
- **By hand:** type `$` and the skill's name, for example `$grill-me`, or pick from `/skills`.

In the [catalog](catalog.md), a command like `/grill-me` becomes `$grill-me` in Codex. Drop the plugin prefix: `/coding:code-review` is `$code-review`.

## What only works in Claude Code

| Skill or plugin | In Codex |
|---|---|
| `suggester` | Doesn't work. It runs on Claude Code hooks. Don't install it. |
| `claude-handoff` | Doesn't work. It launches a new Claude Code session. Use `handoff` instead and paste its summary into a new Codex session. |
| `implement-spec`, `wayfinder`, `research` | Work, but they were written for Claude's sub-agents and its Skill tool. Codex follows them its own way, so results vary more. |
| `taste-skill`, `searchfit-seo`, `ponytail` | Not included, because they live in their own repositories. Check each one's README for Codex support. |

Everything else, including both security skills, works the same in both tools.

## Keep them up to date

```text
npx skills update -g
```

Skills in this collection are pinned versions of each author's work; updates arrive here first and are listed in the [changelog](https://github.com/iatee/claude-skills/blob/main/CHANGELOG.md).
