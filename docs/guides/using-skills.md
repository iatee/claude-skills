---
title: Using skills
description: What skills are, how to install this collection, how to start a skill, and how the suggester helps you remember them.
---

## What is a skill?

A skill is a set of instructions Claude loads when a particular job comes up. Think of it as a recipe card: a short description on the front says when it's useful, and the back holds the step-by-step method.

Only the descriptions stay in Claude's memory. The full method is read only when a skill is used, so you can have hundreds installed without slowing Claude down.

Skills come in two kinds:

- **Automatic skills.** Claude reads the descriptions and picks one up by itself when your request matches, without you doing anything. You can also start them by hand.
- **Command skills.** You start these yourself by typing a slash command, like `/grill-me`. They do bigger things, such as running a whole interview or building a feature, so Claude never starts them on its own.

The [catalog](catalog.md) shows which kind each skill is.

## Install this collection

Skills are shared in **plugins**: bundles of skills (and sometimes other add-ons) that you install with one command. Plugins are listed in a **marketplace**. This collection is a marketplace called `iatee-skills`.

Inside Claude Code, run these three commands, one at a time:

```text
/plugin marketplace add iatee/claude-skills
```

```text
/plugin install all@iatee-skills
```

```text
/reload-plugins
```

That's it. `all` installs every recommended plugin:

| Plugin | For |
|---|---|
| `planning` | Turning ideas into plans: interviews, specs, tickets, research, a decision council |
| `coding` | Building and fixing code: test-first development, debugging, code review, browser automation |
| `frontend` | Making interfaces look good: `impeccable` and `taste-skill` |
| `writing` | Writing for people and for AI agents, and learning new things |
| `sessions` | Handing work to a fresh session, and looking back on finished work |
| `suggester` | Tells you when one of your skills fits what you're doing |

Two more are opt-in, because they change every session: `ponytail` (pushes Claude toward the simplest code that works) and `observer` (collects ideas for new skills as you work). Install either with `/plugin install ponytail@iatee-skills` or `/plugin install observer@iatee-skills`.

Prefer only some of it? Install single plugins instead of `all`, for example `/plugin install frontend@iatee-skills`.

### Two extra installs

- **Node.js** for the suggester. Download the LTS version from [nodejs.org](https://nodejs.org). Without it, Claude Code shows a reminder when a session starts, and everything else works normally.
- **Playwright CLI** if you want Claude to drive a browser. In your terminal, run `npm install -g @playwright/cli` (this needs Node.js too).

## Start a skill

Type `/` in Claude Code to see every command and skill. Keep typing to filter the list.

```text
/grill-me I want to start a newsletter about home gardening
```

Anything you type after the command is passed to the skill, so you can give it the topic straight away.

Every plugin skill also has a long name with the plugin in front, like `/planning:grill-me`. You only need the long name when two things share a short name. The one case in this collection: **use `/coding:code-review`** for the review skill here, because plain `/code-review` is Claude Code's own built-in review.

For automatic skills you don't need to do anything. Ask for what you want ("this test keeps failing and I don't know why") and Claude picks up the right skill.

## The suggester

Nobody remembers fifty skills. The suggester watches each message you send and, when one of your installed skills clearly fits, Claude mentions it in one line:

> 💡 `/coding:tdd` could help here: it builds this test-first, one step at a time.

It doesn't start anything; that's up to you. It stays quiet when nothing fits, mentions each skill only once per conversation, and knows every skill you have installed, not just the ones from this collection.

| Command | What it does |
|---|---|
| `/suggester off` | Mute suggestions. |
| `/suggester on` | Turn them back on. |

## Keep it up to date

New skills and fixes arrive through the marketplace. To get them, run this in your terminal (not inside Claude Code):

```bash
claude plugin marketplace update iatee-skills
claude plugin update all@iatee-skills
```

Then, inside Claude Code, run `/reload-plugins`. This last step matters when a plugin was newly added to `all`; it's what installs it. The [changelog](https://github.com/iatee/claude-skills/blob/main/CHANGELOG.md) lists what changed.

## Remove it

In your terminal:

```bash
claude plugin uninstall all@iatee-skills
claude plugin prune
```

`prune` removes the plugins that `all` brought along and nothing else needs. Or remove everything at once, including the marketplace:

```bash
claude plugin marketplace remove iatee-skills
```

## Where to go next

- **[Skill catalog](catalog.md):** every skill, what it does, and when to use it.
- **[Power user guide](power-user.md):** chain skills into workflows and write your own.
