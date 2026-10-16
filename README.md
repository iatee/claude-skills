# Claude Skills

A curated set of [Claude Code](https://code.claude.com) skills: the ones worth using, credited to the people who wrote them, plus a few of our own.

> **Work in progress.** The full skill catalog, guides and website at [skills.garciabaertsch.com](https://skills.garciabaertsch.com) are on the way.

## Install

In Claude Code, run:

```
/plugin marketplace add iatee/claude-skills
/plugin install all@iatee-skills
```

`all` installs every recommended plugin. To pick and choose, install one or more of these instead:

| Plugin | What's inside |
|---|---|
| `planning` | Grilling interviews, specs, tickets, triage, research |
| `coding` | Implement, TDD, bug diagnosis, code review, architecture (installs `planning` too) |
| `frontend` | `impeccable`, for designing and polishing interfaces |
| `writing` | Writing for people and for agents, teaching, re-pitching |
| `sessions` | Handoffs to a fresh agent, retrospectives |
| `suggester` | Suggests the right skill when it clearly fits, so you don't have to remember them all. Needs [Node.js](https://nodejs.org). `/suggester off` mutes it. |
| `observer` | Opt-in: `task-observer`, which suggests skill improvements as you work. Not in `all`, because it runs every session. |

## Credits

Most skills here were written by others and are redistributed under their licenses:

- **Matt Pocock**: [mattpocock/skills](https://github.com/mattpocock/skills) (MIT)
- **Paul Bakaus**: [impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0)
- **Eoghan Henn / [rebelytics.com](https://rebelytics.com)**: [One Skill to Rule Them All](https://github.com/rebelytics/one-skill-to-rule-them-all) (CC-BY-4.0)

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for exact versions and changes.

## Maintaining

- `node scripts/vendor.mjs sync` shows what changed upstream; `node scripts/vendor.mjs sync <source>` accepts it.
- `node scripts/check.mjs` validates every skill and plugin. CI runs it on every push.
