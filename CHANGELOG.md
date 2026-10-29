# Changelog

Each plugin is versioned on its own. Update a plugin with `/plugin marketplace update iatee-skills`.

## 2026-10-29

- **suggester 1.9.3:** a skill installed twice (from a plugin and from claude.ai) takes only one of the three suggestion slots, so it no longer crowds out a better fit. Recognizes "submits twice" and "logged out" as bug reports, and "live schalten", "mettre en ligne" and "poner en línea" as launching an app.
- **suggester 1.9.2:** skips claude.ai plugins you turned off in Claude Code (`claude plugin disable <name>@synced`), so it no longer suggests their skills.
- **suggester 1.9.1:** `/suggester skills` hands Claude just the names, grouped by plugin, about 2,400 tokens for 400 skills instead of having it read the full list (about 14,000).
- **suggester 1.9.0:** suggests a security check at more moments, for any app, not only websites: going to production or the app store, making a repository public (keys in old commits become readable too), and switching payments to live mode. A skill named at one moment isn't named again at the next. New `/suggester skills` lists every skill you have installed, grouped by plugin; the list is kept in `~/.claude/skill-suggester/installed-skills.md`, and Claude points you to it once after you install or update the suggester.
- **suggester 1.8.0:** better suggestions overall. Skills only you can start, such as `grill-me`, `council` and `to-spec`, are now listed for Claude once per session, so it notices when one fits however you put it (about 700 more tokens per session). Word matching is sharper: a plugin's name no longer counts as part of each skill's name (every `coding` skill matched "code"), "translate" now meets "translation", and trigger words match their other endings ("crash" matches "crashes" and "crashed"). Many more everyday phrasings point to the right skill ("it doesn't work anymore", "this codebase is a mess", "should we...", "user stories"), and a few broad ones that misfired were narrowed.
- **suggester 1.7.0:** brings up the security skills far more often: `vibe-security` when you ask whether something is safe, mention API keys, payments, Supabase rules or going to production, and `vibesec` when you build logins, uploads, admin pages, cron jobs or anything that takes a URL or user content. `vibe-security` is now also suggested before you publish a site.
- **security 1.2.0:** `vibe-security` checks five more things: XSS through React's escape hatches (`dangerouslySetInnerHTML`, `javascript:` links, user markdown), SSRF in features that fetch a URL the user gives, open redirects after login, CSRF with cookie sessions, and admin, cron and debug routes left open.

## 2026-10-28

- **security 1.1.1:** `vibe-security` no longer starts on a plain "check my code"; it needs a security angle.
- **security 1.1.0:** `vibe-security` checks eight more things AI-built apps get wrong: Supabase views that bypass row-level security, command injection, prototype pollution, tokens made with `Math.random()` and secrets compared with `===`, password reset and OAuth flows, race conditions that let credits or coupons be used twice, webhook retries and non-Stripe signatures, and secrets in logs and error trackers.
- **suggester 1.6.0:** prefers skills from this collection and your own skill folders, so big plugin packs no longer crowd them out on common words. Other skills still come up when they clearly fit better. Add marketplaces of your own under `"prefer"` in your settings.
- **suggester 1.5.1:** milestone phrases accept any article, so "create the pull request" or "push our changes" now bring up the review checks, not only "create a pull request". "Pull request" no longer matches skills about requests, such as `change-request`.
- **security 1.0.0:** new. `vibe-security` by Chris Raroque audits an app for the holes AI assistants leave (exposed keys, open Supabase or Firebase tables, unchecked auth, client-set prices, missing rate limits); `vibesec` by BehiSecc keeps Claude from writing IDOR, XSS, CSRF, SSRF and JWT mistakes in the first place. Changed from upstream: `vibe-security` also checks for invented and lookalike dependencies and no longer takes over every code review; `vibesec` loads only for code that touches what it covers, not for all web work; outdated PHP and `x-forwarded-for` advice is fixed.
- **all 1.2.0:** now includes `security`. Run `/reload-plugins` after updating.
- **suggester 1.5.0:** works in Codex too ([setup](https://skills.garciabaertsch.com/codex/#the-skill-suggester-in-codex)). When Claude uses a suggested skill on its own, it now says so in one line, so you can see the suggester at work. Filler words like "something", "too" and "work" no longer count toward a match, which stopped some unrelated suggestions. Also suggests `vibe-security` before you merge or open a pull request.
- New guide: [Using these skills in Codex](https://skills.garciabaertsch.com/codex/).

## 2026-10-17

- **suggester 1.4.0:** milestones now work in any wording, language or spelling ("wraping up", "I'm heading out"): at session start Claude is told what each moment means and which installed skills fit, about 300 tokens once per session. The phrase lists stay as the guaranteed trigger, now with "wrap it up".
- **planning 1.2.0:** adds `prototype` (by Matt Pocock), which `wayfinder` calls for its prototype tickets but which wasn't included, so those tickets failed unless another plugin happened to have a skill by that name.
- **coding 1.1.1:** `playwright-cli` says when to use it, so Claude reaches for it on its own; `tdd` points to `coding:code-review` rather than the built-in review.
- **all 1.1.1:** the description names both opt-in plugins it leaves out, and the manifest states its license. No change in what it installs.
- **suggester 1.3.0:** suggests checks at milestones: design, SEO and accessibility before you publish a website, a review before you merge or release, and a handoff when you wrap up, in English, Spanish, German, French and Portuguese. Now also finds plugin commands, skills in custom plugin folders and Claude Code's built-in skills, so it knows every skill Claude Code offers. Add your own moments, with any skill you have, under `"milestones"` in your settings. Knows when to suggest searchfit-seo's blog-writing, SEO-check and AI-visibility skills.
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
