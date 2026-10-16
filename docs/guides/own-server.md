---
title: Your own Claude server
description: Turn an always-on computer into a Claude Code server you can drive from your phone or any browser.
---

Claude Code doesn't have to run on the laptop in front of you. Put it on a computer that's always on, such as a spare laptop, a Mac mini, a mini PC, a home server or a rented cloud server, and you can start and steer work from your phone or any browser. The work happens on that machine, with its files and tools, while you're somewhere else.

The piece that makes this work is **Remote Control**. Claude Code on the server connects out to Anthropic, and you connect to it through [claude.ai/code](https://claude.ai/code) or the Claude app. You don't need to open ports, set up a VPN or configure your router.

## What you need

- **An always-on computer** running macOS, Linux or Windows, connected to the internet.
- **A Claude Pro, Max, Team or Enterprise plan.** Remote Control works only with a claude.ai login, not with API keys. On Team and Enterprise, an admin has to switch Remote Control on first.
- **The Claude app** on your phone ([iOS](https://apps.apple.com/us/app/claude-by-anthropic/id6473753684), [Android](https://play.google.com/store/apps/details?id=com.anthropic.claude)), or any browser.

## 1. Set up the machine

Install Claude Code on the server exactly as in [Start here](start-here.md), plus whatever your projects need: git, Node.js, and the [GitHub CLI](https://cli.github.com) if Claude should push code. Then run `claude` once and sign in with your Claude account.

If the machine has no screen, connect to it from another computer with SSH (`ssh you@server`) and do all of this in that terminal.

Put the projects you want to work on in a folder on the server, for example by cloning them with git.

## 2. Keep it awake

A sleeping computer can't answer. Claude Code reconnects by itself after sleep, but nothing happens while the machine sleeps.

- **macOS:** System Settings → Energy (or Battery → Options on a laptop) → turn on **Prevent automatic sleeping when the display is off**. A laptop also needs to stay plugged in.
- **Windows:** Settings → System → Power → set **Sleep** to **Never** when plugged in.
- **Linux:** run `sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target`. Servers usually don't sleep anyway.

## 3. Start the server

In the project folder on the server, run:

```bash
claude remote-control --name "Home server" --spawn worktree
```

- `--name` is how the session shows up on your phone.
- `--spawn worktree` gives each new session its own copy of the project (a git worktree), so two sessions you start from your phone don't edit the same files at once. Leave it out for a folder that isn't a git repository.

The first time, Claude Code asks you to trust the folder and to confirm Remote Control. Answer `y`. It then shows a link, and pressing the spacebar shows a QR code.

### Keep it running after you log out

`claude remote-control` stops when its terminal closes. On a server, start it inside **tmux**, which keeps programs running after you disconnect:

```bash
tmux new -s claude
claude remote-control --name "Home server" --spawn worktree
```

Press `Ctrl+B`, then `D`, to leave it running. `tmux attach -t claude` brings you back. Install tmux with `brew install tmux` on a Mac or `sudo apt install tmux` on Debian and Ubuntu. On Windows, use WSL, or just leave the terminal window open.

If you stop the server, `claude remote-control` in the same folder brings its sessions back, for about four hours.

## 4. Connect from your phone

Open the Claude app and tap **Code**, or open [claude.ai/code](https://claude.ai/code) in a browser. Your server's session appears with a computer icon and a green dot. Tap it and start typing. You can attach photos and files too; they're sent to the server.

Everything stays in sync. You can start something on your phone and continue in the server's terminal, or the other way round.

## Useful options

| Option | What it does |
|---|---|
| `--permission-mode acceptEdits` | Sessions edit files without asking each time. You're not at the keyboard to approve everything, so this saves a lot of tapping. Commands still ask. |
| `--capacity 4` | Limits how many sessions can run at once. Each session uses your plan's usage. |
| `--continue` | Brings back only the last session instead of all of them. |
| `/config` → **Enable Remote Control for all sessions** | Every normal `claude` session on the machine becomes reachable from your phone too. |

Claude can also notify your phone when it needs an answer. In `/config`, turn on the push notification settings for permission prompts and questions.

For work you want to keep running in the background without a phone connected, look at **agent view**: run `claude agents`, type a task, and it runs as a background session that survives closing the terminal. Background sessions stop when the machine shuts down. See [agent view](https://code.claude.com/docs/en/agent-view).

## Stay safe

- **Your Claude account is the key.** Anyone signed in to your Claude account can drive this machine. Keep that account secure.
- **Claude acts as the user it runs as.** Consider a separate user account on the server that only has access to the projects it needs, not your documents or passwords.
- **Transcripts pass through Anthropic.** While Remote Control is connected, the conversation is stored on Anthropic's servers so it can sync between devices. Your files stay on the machine. See Anthropic's [data usage policy](https://code.claude.com/docs/en/data-usage).
- **Sandboxing limits damage.** With [sandboxing](https://code.claude.com/docs/en/sandboxing) turned on in your settings, the commands Claude runs can only reach the folders and websites you allow.

## Other ways to work away from your desk

- **SSH and tmux:** connect to the server from a laptop with SSH and run `claude` inside tmux. This needs a laptop, but no phone or browser.
- **Cloud sessions:** [claude.ai/code](https://claude.ai/code) can also run Claude on Anthropic's machines against a GitHub repository, with no server of your own. That suits quick tasks; your own server suits work that needs your files, tools and setup.
