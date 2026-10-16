---
title: Customize Claude Code
description: Add a status bar, change Claude Code itself with mods, and give Claude a memory that lasts between sessions.
---

Skills change what Claude *knows how to do*. This guide covers changing Claude Code *itself*: what it shows you, how it behaves, and what it remembers.

## A status bar

The status line is a bar at the bottom of Claude Code that shows whatever you want: the model, how full the conversation is, the git branch, what the session has cost so far. It runs locally and costs no tokens.

### The easy way

Describe what you want, and Claude Code writes it for you:

```text
/statusline show the model, the git branch, and how full the context is as a progress bar
```

Approve the file changes it asks about, and the bar appears. To change it, run `/statusline` again with a new description. To remove it, run `/statusline remove it`.

### How it works

A status line is a small script. After every message, Claude Code runs it, sends it information about the session as JSON, and shows whatever the script prints. The script is set up in `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline.js"
  }
}
```

Here's a complete script that shows the model and a context bar. It uses Node.js, so it works on Mac, Windows and Linux. Save it as `~/.claude/statusline.js`:

```javascript
let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const data = JSON.parse(input);
  const pct = Math.floor(data.context_window?.used_percentage || 0);
  const filled = Math.floor(pct / 10);
  const bar = "▓".repeat(filled) + "░".repeat(10 - filled);
  console.log(`[${data.model.display_name}] ${bar} ${pct}%`);
});
```

Useful fields your script receives:

| Field | What it holds |
|---|---|
| `model.display_name` | The current model |
| `workspace.current_dir` | The folder Claude Code is working in |
| `context_window.used_percentage` | How full the conversation is. Near 100%, it's time for `/clear` or `/compact`. |
| `cost.total_cost_usd` | Estimated cost of this session, at list price |
| `rate_limits.five_hour.used_percentage` | How much of your 5-hour usage limit is used |
| `session_id` | The session's ID |

Each line your script prints becomes a row, and colors work with standard terminal color codes. If you want a clock or anything else that changes while Claude is idle, add `"refreshInterval": 5` to re-run it every five seconds. The full field list is in Anthropic's [status line guide](https://code.claude.com/docs/en/statusline).

## Mods: change Claude Code itself

A **mod** is a plugin that runs code *inside* Claude Code. Where a hook or status line runs a script from the outside, a mod can:

- **Draw interface:** a pane beside the conversation, or a band above the prompt with buttons and text fields
- **Restyle what Claude Code draws:** the spinner, how tool calls look, the question dialog
- **Step into tool calls:** hold a risky command and ask you first, or answer it without running it
- **Add instant commands:** a `/command` that runs your code right away, with no Claude turn and no tokens

Mods need Claude Code v2.1.287 or later. Check with `claude --version`.

### Make one by describing it

```text
make a mod that shows the current git branch above the prompt
```

Claude writes the mod using its built-in `plugin-authoring` skill. When it saves the first file, Claude Code asks whether to turn on hot reloading for the session. Say yes, and the mod loads when Claude finishes, and reloads every time Claude changes it. Tell Claude what to change until it's right.

A mod written this way lives only in that session. To keep it, ask Claude to "copy this mod to `~/mods/git-branch`", then start Claude Code with `claude --plugin-dir ~/mods/git-branch`, or add it to a marketplace like this one so you can install it everywhere.

### Try some

Anthropic publishes sample mods in [claude-code-playground](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods):

- **token-weather:** a forecast of your context window above the prompt
- **blast-radius:** holds commands like `rm -rf` or a force push and shows what they'd change, with buttons to go ahead or cancel
- **replay-theater:** a `/replay` command that steps through the edits Claude made in the last turn

### Be careful with mods

A mod runs with **your** permissions and isn't sandboxed. It can read your files and secrets, see every prompt, and approve actions without asking. Install mods only from people you trust. To see what a mod does before installing it, download it and run `claude plugin validate ./the-mod`. The output lists every event it listens to and everything it asks to do.

To switch mods off: disable the plugin in `/plugin`, start one session with `claude --safe-mode`, or set `"disableAllHooks": true` in `~/.claude/settings.json` (that also stops hooks and your status line).

## Memory between sessions

By default, every new conversation starts fresh. Three layers change that, from built-in to add-on.

### 1. CLAUDE.md: instructions you write

A `CLAUDE.md` file holds instructions Claude reads at the start of every session: how to run the tests, which style to follow, what to avoid. Run `/init` in a project and Claude writes a first version by looking around.

- `CLAUDE.md` in a project folder applies to that project and can be shared with your team through git.
- `~/.claude/CLAUDE.md` applies to every project on your computer: personal preferences like "always answer in German" or "never add yourself as a co-author on commits".

Keep it short and specific. It's read every session, so every line costs a little.

### 2. Auto memory: notes Claude writes

Claude also keeps its own notes per project: your preferences, corrections you've given it, decisions it can't read from the code. When you see "Saved 1 memory" or "Recalled 2 memories", that's auto memory working. It's on by default. Open `/memory` to see the notes or switch it off.

Auto memory is **per project**. Something you teach Claude in one repository isn't known in another, so put rules you want everywhere in `~/.claude/CLAUDE.md` instead.

### 3. claude-mem: a searchable history

[claude-mem](https://github.com/thedotmack/claude-mem) by Alex Newman goes further. It records what happens in every session, has an AI compress it into short observations, and feeds the relevant ones into future sessions automatically. You can also search it ("how did we fix the login bug last month?") through its `mem-search` skill, and browse everything in a local web viewer.

Install it inside Claude Code:

```text
/plugin marketplace add thedotmack/claude-mem
```

```text
/plugin install claude-mem
```

Then restart Claude Code. It needs Node.js 20 or later and installs its other helpers (Bun and uv) itself if they're missing. Its settings live in `~/.claude-mem/settings.json`.

Good to know:

- **Use the `/plugin` commands or `npx claude-mem install`.** `npm install -g claude-mem` installs only a library and doesn't set up memory.
- **`npx claude-mem install` offers a hosted service.** At the end it asks you to sign in to claude-mem's own service, with a free trial. That's optional; the `/plugin` route above doesn't ask.
- **`mem-search` comes with it.** That's why this collection doesn't include its own copy.
- **It writes down a lot.** Everything Claude does in a session is captured, so don't use it on projects whose contents must not be stored.

**Which should you use?** Start with `CLAUDE.md` and auto memory: they're built in, private to your machine, and enough for most people. Add claude-mem when you work on the same projects for months and want to search what happened before.
