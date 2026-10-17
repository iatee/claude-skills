---
title: Privacy
description: What the suggester plugin and this website read, store and send.
---

Claude Skills is an unofficial, personal project. It has no servers of its own and collects nothing: no accounts, no analytics, no tracking.

## The suggester plugin

The suggester runs entirely on your computer, inside Claude Code. It makes no network requests and sends nothing to the author or to anyone else.

To decide whether a skill fits, it reads:

- the prompt you send and its session ID, which Claude Code passes to the plugin's hook;
- the current session's transcript, to skip skills you have already used and to find numbered plans in Claude's replies;
- `~/.claude/plugins/installed_plugins.json` and `~/.claude/settings.json`, to find enabled plugins;
- the name and description of each installed skill.

Your prompts and transcripts can contain personal details you have typed, such as names or email addresses. The suggester reads them only to match skills and doesn't copy them anywhere.

It stores, only in `~/.claude/skill-suggester/` on your computer:

- `settings.json`: whether suggestions are on, and your own options;
- `index.json`: a cache of installed skill names and descriptions;
- one small file per session listing the skills already suggested;
- one file per project in `plans/` with that project's latest plan: each step's command, the short description Claude wrote beside it, and which steps have run.

Nothing is sent off your computer, so nothing is retained anywhere else. To remove everything the suggester stored, uninstall the plugin and delete `~/.claude/skill-suggester/`.

What Claude itself does with your prompts is covered by Anthropic's own privacy policy, not by this page.

## This website

skills.garciabaertsch.com is a static site hosted on GitHub Pages. It sets no cookies and runs no analytics.

- GitHub serves the pages and may log requests, as described in the [GitHub privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
- The fonts are served from this site, so pages contact no other servers when they open.
- The guides remember your light or dark choice in your browser's local storage. It never leaves your browser.
- Search runs in your browser. Nothing you type in it is sent anywhere.
- The "Summarize with" links open ChatGPT, Claude, Perplexity or Google with the page's address and a short prompt filled in. Nothing is sent until you click one, and then that service's own privacy policy applies.

## Contact

Questions about privacy: open an issue at [github.com/iatee/claude-skills](https://github.com/iatee/claude-skills/issues).
