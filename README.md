# Claude Skills

A curated set of [Claude Code](https://code.claude.com) skills: the ones worth using, credited to the people who wrote them, plus a skill suggester of our own that tells you when one of them fits.

**Website:** [skills.garciabaertsch.com](https://skills.garciabaertsch.com)

## Install

You need Claude Code first. New to it? Read [Start here](docs/guides/start-here.md).

In Claude Code, run:

```
/plugin marketplace add iatee/claude-skills
/plugin install all@iatee-skills
/reload-plugins
```

`all` installs every recommended plugin. To pick and choose, install one or more of these instead:

| Plugin | What's inside |
|---|---|
| `planning` | Grilling interviews, specs, tickets, triage, research, prototypes, a seven-persona council |
| `coding` | Implement, TDD, bug diagnosis, code review, architecture, browser automation (installs `planning` too) |
| `frontend` | `impeccable` for designing and polishing interfaces, `taste-skill` for art direction, and `searchfit-seo` for SEO and AI-search visibility |
| `writing` | Writing for people and for agents, teaching, re-pitching |
| `sessions` | Handoffs to a fresh agent, retrospectives |
| `suggester` | Suggests the right skill when it clearly fits, so you don't have to remember them all. Needs [Node.js](https://nodejs.org). `/suggester off` mutes it. |
| `ponytail` | Opt-in: lazy senior dev mode, which pushes Claude to the smallest solution that works. Not in `all`, because it changes every session. |
| `observer` | Opt-in: `task-observer`, which suggests skill improvements as you work. Not in `all`, because it runs every session. |

## Guides

1. **[Start here](docs/guides/start-here.md)**: install Claude Code and get through your first session.
2. **[Using skills](docs/guides/using-skills.md)**: what skills are, how to install and start them, and how the suggester helps.
3. **[Power user](docs/guides/power-user.md)**: chaining skills into workflows, choosing between similar skills, and writing your own.
4. **[Customize Claude Code](docs/guides/customize.md)**: a status bar, mods that change Claude Code itself, and memory between sessions (including claude-mem).
5. **[Your own Claude server](docs/guides/own-server.md)**: run Claude Code on an always-on machine and drive it from your phone.

## Catalog

<!-- catalog:start -->
| Skill | Plugin | What it does | Use it when | How to start it | Credit |
|---|---|---|---|---|---|
| [**council**](https://skills.garciabaertsch.com/skills/council/) | `planning` | Seven expert personas debate a question, then give a verdict with risks and next steps. | You face a decision and want it argued from very different angles. | `/council` | [Claude Council Contributors](https://github.com/itshussainsprojects/Claude-Council-Skill) |
| [**domain-modeling**](https://skills.garciabaertsch.com/skills/domain-modeling/) | `planning` | Builds a shared vocabulary for a project in CONTEXT.md and records decisions as ADRs. | Words in your project mean different things to different people. | Automatic, or `/domain-modeling` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**grill-me**](https://skills.garciabaertsch.com/skills/grill-me/) | `planning` | Starts a grilling interview about whatever you describe. | You want to stress-test an idea, anywhere, with no files involved. | `/grill-me` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**grill-with-docs**](https://skills.garciabaertsch.com/skills/grill-with-docs/) | `planning` | Grilling that also writes down the decisions as a glossary and ADRs in your repo. | You're planning inside a project and want the reasoning kept. | `/grill-with-docs` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**grilling**](https://skills.garciabaertsch.com/skills/grilling/) | `planning` | The interview engine behind grill-me: relentless questions, in rounds, until the plan has no gaps. | You have a plan or idea and want its holes found before you build. | Automatic, or `/grilling` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**prototype**](https://skills.garciabaertsch.com/skills/prototype/) | `planning` | Builds a throwaway prototype, of the logic or of a UI, to answer one design question. | You can't decide how something should behave or look until you see it. Wayfinder uses it too. | Automatic, or `/prototype` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**research**](https://skills.garciabaertsch.com/skills/research/) | `planning` | Sends a background agent to read primary sources and write the findings to a file. | You need facts from docs or APIs and don't want to wait while they're gathered. | Automatic, or `/research` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**setup-matt-pocock-skills**](https://skills.garciabaertsch.com/skills/setup-matt-pocock-skills/) | `planning` | One-time setup for a repo: issue tracker, triage labels, where docs live. | Before the first use of to-spec, to-tickets, triage, wayfinder or code-review in a repo. | `/setup-matt-pocock-skills` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**to-questionnaire**](https://skills.garciabaertsch.com/skills/to-questionnaire/) | `planning` | Turns open questions into a questionnaire someone else can fill in. | You can't answer a decision yourself and need input from a client or colleague. | `/to-questionnaire` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**to-spec**](https://skills.garciabaertsch.com/skills/to-spec/) | `planning` | Turns the conversation so far into a written spec on your issue tracker. | A grilling session is done and the result should become a spec. | `/to-spec` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**to-tickets**](https://skills.garciabaertsch.com/skills/to-tickets/) | `planning` | Splits a plan or spec into small tickets, each saying what it waits on. | Work is too big for one session and needs to be done piece by piece. | `/to-tickets` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**triage**](https://skills.garciabaertsch.com/skills/triage/) | `planning` | Sorts incoming issues and pull requests, checks them, and writes agent-ready briefs. | Bug reports and requests from others are piling up. | `/triage` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**wayfinder**](https://skills.garciabaertsch.com/skills/wayfinder/) | `planning` | Maps a huge, unclear project as decision tickets and resolves them one by one. | The project is so big or foggy you don't know where to start. | `/wayfinder` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**code-review**](https://skills.garciabaertsch.com/skills/code-review/) | `coding` | Reviews changes on two axes: your repo's coding standards and what the spec asked for. | A branch or pull request is ready for review. | Automatic, or `/coding:code-review` (plain `/code-review` is Claude Code's own, different review) | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**codebase-design**](https://skills.garciabaertsch.com/skills/codebase-design/) | `coding` | Shared vocabulary for designing deep modules with small interfaces. | You're deciding how to shape a module, interface or seam. | Automatic, or `/codebase-design` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**diagnosing-bugs**](https://skills.garciabaertsch.com/skills/diagnosing-bugs/) | `coding` | Reproduces a hard bug with one failing command before fixing it, then adds a regression test. | Something is broken, flaky or slow and the cause isn't obvious. | Automatic, or `/diagnosing-bugs` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**implement**](https://skills.garciabaertsch.com/skills/implement/) | `coding` | Builds a spec or ticket test-first, then reviews and commits it. | A ticket or small spec is ready to be built. | `/implement` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**implement-spec**](https://skills.garciabaertsch.com/skills/implement-spec/) | `coding` | Builds a whole spec with parallel sub-agents and opens one pull request. | A spec with many tickets is ready and you want it built in one go. | `/implement-spec` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**improve-codebase-architecture**](https://skills.garciabaertsch.com/skills/improve-codebase-architecture/) | `coding` | Scans a codebase for places to simplify and shows them as a visual report. | The code feels tangled and you want to know where to start cleaning up. | `/improve-codebase-architecture` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**playwright-cli**](https://skills.garciabaertsch.com/skills/playwright-cli/) | `coding` | Drives a real browser from the terminal: open pages, click, fill forms, take screenshots. | Claude should test, inspect or automate a website. Needs `npm install -g @playwright/cli`. | Automatic, or `/playwright-cli` | [Microsoft](https://github.com/microsoft/playwright-cli) |
| [**resolving-merge-conflicts**](https://skills.garciabaertsch.com/skills/resolving-merge-conflicts/) | `coding` | Resolves a merge or rebase conflict by finding out why each side changed. | Git stopped a merge or rebase with conflicts. | Automatic, or `/resolving-merge-conflicts` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**setup-pre-commit**](https://skills.garciabaertsch.com/skills/setup-pre-commit/) | `coding` | Adds Husky pre-commit hooks for formatting, type checks and tests. | You want checks to run automatically before every commit. | Automatic, or `/setup-pre-commit` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**tdd**](https://skills.garciabaertsch.com/skills/tdd/) | `coding` | Test-driven development, one red-green step at a time. | You want a feature or fix built test-first. | Automatic, or `/tdd` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**wizard**](https://skills.garciabaertsch.com/skills/wizard/) | `coding` | Writes an interactive script that walks you through steps only a human can do. | A setup needs you to click through dashboards or paste secrets. | Automatic, or `/wizard` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**impeccable**](https://skills.garciabaertsch.com/skills/impeccable/) | `frontend` | Designs, critiques and polishes frontend interfaces, with 20+ sub-commands like audit, polish and typeset. | A page or app works but doesn't look or feel right. | Automatic, or `/impeccable` | [Paul Bakaus](https://github.com/pbakaus/impeccable) |
| [**teach**](https://skills.garciabaertsch.com/skills/teach/) | `writing` | Teaches you a concept step by step, using your own workspace as the example. | You want to understand something, not just have it done. | `/teach` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**wait-what**](https://skills.garciabaertsch.com/skills/wait-what/) | `writing` | Makes Claude re-explain its last message in plain, simple English. | Claude's last answer lost you. | `/wait-what` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**writing-for-agents**](https://skills.garciabaertsch.com/skills/writing-for-agents/) | `writing` | How to write skills, CLAUDE.md and AGENTS.md files that agents follow well. | You're writing or editing a skill or agent instructions. | Automatic, or `/writing-for-agents` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**writing-fragments**](https://skills.garciabaertsch.com/skills/writing-fragments/) | `writing` | Collects raw thoughts and fragments for a piece of writing, with no structure yet. | You're at the start of an article and have ideas but no outline. | `/writing-fragments` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**writing-shape**](https://skills.garciabaertsch.com/skills/writing-shape/) | `writing` | Shapes raw material into an article, paragraph by paragraph. | You have the material and want it turned into a finished text. | `/writing-shape` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**claude-handoff**](https://skills.garciabaertsch.com/skills/claude-handoff/) | `sessions` | Hands the work to a new background agent that continues straight away. | You want the work to go on in the background while you do something else. | `/claude-handoff` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**handoff**](https://skills.garciabaertsch.com/skills/handoff/) | `sessions` | Writes a handoff document so a fresh session can continue the work. | The conversation is getting long or you'll continue another day. | `/handoff` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**retro**](https://skills.garciabaertsch.com/skills/retro/) | `sessions` | Runs a short retrospective on the session: what worked, what didn't, what to change. | A piece of work is finished and you want to learn from it. | `/retro` | [Matt Pocock](https://github.com/mattpocock/skills) |
| [**suggester**](https://skills.garciabaertsch.com/skills/suggester/) | `suggester` | Turns skill suggestions on or off. | Suggestions get in your way, or you want them back. | `/suggester` | Iatee |
| [**taste-skill**](https://skills.garciabaertsch.com/skills/taste-skill/) | `taste-skill` | 14 skills for art direction: design directions, reference images, brand kits and style presets. | Generated frontends look generic and you want a distinct visual style. | Automatic, or `/taste-skill` | [leonxlnx](https://github.com/Leonxlnx/taste-skill) |
| [**searchfit-seo**](https://skills.garciabaertsch.com/skills/searchfit-seo/) | `searchfit-seo` | 11 skills, 6 commands and 3 agents for SEO: site audits, technical SEO, keyword clustering, schema markup, content plans and visibility in AI answers. | You're building a site and want it found on Google and cited by ChatGPT or Perplexity. | Automatic, or `/searchfit-seo:seo-check` | [SearchFit.ai](https://github.com/searchfit/searchfit-seo) |
| [**ponytail**](https://skills.garciabaertsch.com/skills/ponytail/) | `ponytail` | Lazy senior dev mode: pushes Claude to the smallest solution that works, plus audit and review commands. | Claude tends to over-engineer and you want leaner code. | Always on once installed; `/ponytail-help` for commands | [Dietrich Gebert](https://github.com/DietrichGebert/ponytail) |
| [**task-observer**](https://skills.garciabaertsch.com/skills/task-observer/) | `observer` | Watches your sessions and proposes new skills or improvements to existing ones. | You build your own skills and want ideas for them collected as you work. | Automatic, or `/task-observer` | [Eoghan Henn / rebelytics.com](https://github.com/rebelytics/one-skill-to-rule-them-all) |

**Not included, and why**

- `ask-matt`: a hand-written guide to Matt Pocock's skills. The suggester does the same job for every installed skill.
- `mem-search`, `mem-setup`: part of the [claude-mem](https://github.com/thedotmack/claude-mem) plugin and useless without it. Install that plugin instead.
- `prompt-cache-control`: a plugin, not a skill. See [claude-code-templates](https://github.com/davila7/claude-code-templates).
- `web-design-guidelines` (Vercel): no license, and `impeccable` covers it.
- `apple-design-skills`: `impeccable` already ships Apple and Android guideline references.
<!-- catalog:end -->

## Credits

Most skills here were written by others and are redistributed under their licenses:

- **Matt Pocock**: [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)
- **Paul Bakaus**: [impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0)
- **Microsoft**: [playwright-cli](https://github.com/microsoft/playwright-cli) (Apache-2.0)
- **Claude Council Contributors**: [Claude-Council-Skill](https://github.com/itshussainsprojects/Claude-Council-Skill) (MIT)
- **Eoghan Henn / [rebelytics.com](https://rebelytics.com)**: [One Skill to Rule Them All](https://github.com/rebelytics/one-skill-to-rule-them-all) (CC-BY-4.0)

Three plugins are installed straight from their authors' repositories rather than copied: [taste-skill](https://github.com/Leonxlnx/taste-skill) by leonxlnx, [searchfit-seo](https://github.com/searchfit/searchfit-seo) by SearchFit.ai and [ponytail](https://github.com/DietrichGebert/ponytail) by Dietrich Gebert (all MIT).

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for exact versions and changes. Everything else in this repository is [MIT](LICENSE).

## Maintaining

- `node scripts/vendor.mjs sync` shows what changed upstream; `node scripts/vendor.mjs sync <source>` accepts it. After editing `patches` or `changes` in `manifest.json`, `node scripts/vendor.mjs notices` regenerates THIRD_PARTY_NOTICES.md.
- `node scripts/catalog.mjs` regenerates the catalog from `catalog.json`.
- `node scripts/check.mjs` validates every skill and plugin, and `node scripts/test-suggester.mjs` tests the suggester against fake plugins. CI runs both, plus the catalog check, on every push.
- After changing a plugin, bump its `version` and add a line to [CHANGELOG.md](CHANGELOG.md).
