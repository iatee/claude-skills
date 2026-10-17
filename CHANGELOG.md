# Changelog

Each plugin is versioned on its own. Update a plugin with `/plugin marketplace update iatee-skills`.

## 2026-10-17

- **frontend 1.2.0:** now also installs `searchfit-seo` by SearchFit.ai, for SEO audits, keyword clustering, schema markup and visibility in AI answers. Run `/reload-plugins` after updating.
- **suggester 1.2.1:** links to the new [privacy policy](https://skills.garciabaertsch.com/privacy/).
- **suggester 1.2.0:** say "run the plan" (or `/suggester plan`) and Claude runs every remaining step of the remembered plan, committing after each, without pausing.
- **suggester 1.1.0:** remembers numbered plans of commands, like the one an `/impeccable audit` ends with. Run one step and Claude names the next step when it's done, even in a later session.
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
