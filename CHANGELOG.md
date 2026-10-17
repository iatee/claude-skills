# Changelog

Each plugin is versioned on its own. Update a plugin with `/plugin marketplace update iatee-skills`.

## 2026-10-17

- **suggester 1.0.2:** hooks now run small shell scripts instead of inline commands, and the plugin has its own README describing everything it reads and writes. No change in behavior.

## 2026-10-16 (new skills)

- **planning 1.1.0:** adds `council`, seven expert personas that debate a decision (by Claude Council Contributors).
- **coding 1.1.0:** adds `playwright-cli`, Microsoft's skill for driving a browser from the terminal. Needs `npm install -g @playwright/cli`.
- **frontend 1.1.0:** now also installs `taste-skill` by leonxlnx, for art direction.
- **suggester 1.0.1:** knows when to suggest `council` and `playwright-cli`.
- **ponytail:** new opt-in plugin, Dietrich Gebert's lazy senior dev mode.

After updating, run `/reload-plugins` so newly added dependencies get installed.

## 2026-10-16 (suggester)

- **suggester 1.0.0:** new. Suggests an installed skill when it clearly fits your prompt. Turn it off with `/suggester off`.
- **all 1.1.0:** now includes `suggester`.

## 2026-10-16 (later)

- **coding 1.0.1:** `implement` and `implement-spec` now call `coding:code-review`, because Claude Code's built-in `/code-review` took over the short name.

## 2026-10-16

- **planning 1.0.0, coding 1.0.0, frontend 1.0.0, writing 1.0.0, sessions 1.0.0, observer 1.0.0, all 1.0.0:** first release. 31 skills from Matt Pocock, Paul Bakaus and Eoghan Henn.
