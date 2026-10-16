---
title: Start here
description: Install Claude Code, get through your first session, and learn the handful of controls that matter.
---

Claude Code is Claude working directly on your computer. Instead of copying text in and out of a chat window, you start it inside a folder and it reads the files there, runs commands, and makes changes, asking your permission along the way.

This guide gets you from nothing to a working first session in about fifteen minutes. You don't need to be a programmer.

## What you need

- **A Claude subscription:** Pro, Max, Team or Enterprise. A [Claude Console](https://platform.claude.com) account with API credits works too. See [pricing](https://claude.com/pricing).
- **A terminal:** the text window where you type commands. On a Mac it's the app called **Terminal**. On Windows, use **PowerShell**. If you've never opened one, Anthropic's [terminal guide](https://code.claude.com/docs/en/terminal-guide) walks you through it.
- **On Windows, also [Git for Windows](https://git-scm.com/downloads/win).** Claude Code works better with it, and the skill suggester in this collection needs it.
- **For the skill suggester, [Node.js](https://nodejs.org)** (the "LTS" version). You can add this later.

## 1. Install Claude Code

Open your terminal, paste the line for your system, and press Enter.

**Mac or Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

The installer shows no progress while it downloads, so give it a minute. When it's done, **close the terminal and open a new one**, then check that it worked:

```bash
claude --version
```

You should see a version number followed by `(Claude Code)`. If the terminal says `claude` isn't found, see [Fix your PATH](https://code.claude.com/docs/en/troubleshoot-install#command-not-found-claude-after-installation).

This version of Claude Code keeps itself up to date in the background.

## 2. Start your first session

Claude Code works inside whatever folder you start it in. Pick a folder you're happy for it to look at: a project, or a new empty folder for practice.

```bash
cd ~/Documents/my-project
claude
```

The first time, Claude Code opens your browser so you can log in with your Claude account. After that you stay logged in.

You'll see a prompt where you can type. Talk to it like a capable colleague:

```text
what's in this folder?
```

```text
create a simple web page that shows a countdown to New Year
```

When Claude wants to change a file or run a command, it asks first. Read what it wants to do, then choose **Yes**, or **No** and tell it what to do instead.

## 3. The controls that matter

| Key or command | What it does |
|---|---|
| `Esc` | Stop Claude mid-answer. It keeps the work done so far, and you can redirect it. |
| `Esc` `Esc` | With an empty prompt: rewind to an earlier point in the conversation and undo changes. |
| `Shift+Tab` | Switch permission mode (see below). |
| `/` | Shows every command and skill you can use. Keep typing to filter. |
| `/clear` | Start a fresh conversation in the same folder. Do this when you switch to an unrelated task. |
| `/resume` | Pick up an earlier conversation. `claude -c` in the terminal continues the most recent one. |
| `/help` | Lists commands. You can also just ask Claude "how do I…". |
| `Ctrl+D` twice, or `/exit` | Quit. |

### Permission modes

`Shift+Tab` cycles through how much Claude may do without asking. The current mode is shown below the prompt.

- **Manual** (the default): Claude asks before every change and command. Start here.
- **Accept edits:** Claude edits files without asking, but still asks before running commands. Good once you trust where a task is going.
- **Plan:** Claude only reads and thinks, then shows you a plan. Nothing changes until you approve it. Use this for anything big.

## 4. Habits that make it work well

- **Be specific.** "Fix the bug where the form submits when it's empty" beats "fix the bug".
- **Plan before big changes.** Switch to plan mode, or ask "make a plan first, don't change anything yet".
- **One task per conversation.** Long conversations get slower and less sharp. `/clear` between unrelated tasks.
- **Let it explore first.** "Look around and explain how this project works" is a great first message in any new folder.
- **Use git if you can.** It's a safety net: every change can be undone. Ask Claude to "set up git for this folder and commit after each step".

## 5. Next: add skills

Out of the box, Claude Code is a generalist. Skills turn it into a specialist for particular jobs: interviewing you about a plan, finding a hard bug, polishing a design. Continue with **[Using skills](using-skills.md)** to install this collection.

## If something goes wrong

- Ask Claude Code itself: "Claude Code isn't doing X, how do I fix it?" It knows its own documentation.
- Anthropic's [troubleshooting guide](https://code.claude.com/docs/en/troubleshoot-install) covers installation errors.
- The free [Claude Code 101](https://academy.claude.com/courses/claude-code-101) course goes deeper on the basics.
