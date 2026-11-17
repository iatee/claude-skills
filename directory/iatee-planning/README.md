# iatee-planning

Sharpen ideas into plans: grilling interviews, specs, tickets, triage, research, throwaway prototypes and a seven-persona council. Skills by Matt Pocock and others.

| Skill | What it does | When to use it |
|---|---|---|
| `council` | Seven expert personas debate a question, then give a verdict with risks and next steps. | You face a decision and want it argued from very different angles. |
| `domain-modeling` | Builds a shared vocabulary for a project in CONTEXT.md and records decisions as ADRs. | Words in your project mean different things to different people. |
| `grill-me` | Starts a grilling interview about whatever you describe. | You want to stress-test an idea, anywhere, with no files involved. |
| `grill-with-docs` | Grilling that also writes down the decisions as a glossary and ADRs in your repo. | You're planning inside a project and want the reasoning kept. |
| `grilling` | The interview engine behind grill-me: relentless questions, in rounds, until the plan has no gaps. | You have a plan or idea and want its holes found before you build. |
| `prototype` | Builds a throwaway prototype, of the logic or of a UI, to answer one design question. | You can't decide how something should behave or look until you see it. Wayfinder uses it too. |
| `research` | Sends a background agent to read primary sources and write the findings to a file. | You need facts from docs or APIs and don't want to wait while they're gathered. |
| `setup-matt-pocock-skills` | One-time setup for a repo: issue tracker, triage labels, where docs live. | Before the first use of to-spec, to-tickets, triage, wayfinder or code-review in a repo. |
| `to-questionnaire` | Turns open questions into a questionnaire someone else can fill in. | You can't answer a decision yourself and need input from a client or colleague. |
| `to-spec` | Turns the conversation so far into a written spec on your issue tracker. | A grilling session is done and the result should become a spec. |
| `to-tickets` | Splits a plan or spec into small tickets, each saying what it waits on. | Work is too big for one session and needs to be done piece by piece. |
| `triage` | Sorts incoming issues and pull requests, checks them, and writes agent-ready briefs. | Bug reports and requests from others are piling up. |
| `wayfinder` | Maps a huge, unclear project as decision tickets and resolves them one by one. | The project is so big or foggy you don't know where to start. |

Part of [Claude Skills](https://skills.garciabaertsch.com), a curated collection of Claude Code skills. This is the directory edition of the `planning` plugin. The full collection, including plugins with hooks and scripts such as the skill suggester, installs from its own marketplace:

```text
/plugin marketplace add https://github.com/iatee/claude-skills.git
```

## Credits

- [Claude Council Contributors](https://github.com/itshussainsprojects/Claude-Council-Skill) (MIT)
- [Matt Pocock](https://github.com/mattpocock/skills) (MIT)

Skills by other authors keep their license file in their folder.
