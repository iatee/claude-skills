# iatee-coding

Build and fix code: implement, TDD, bug diagnosis, two-axis code review, architecture and browser automation with playwright-cli. Skills by Matt Pocock and Microsoft.

| Skill | What it does | When to use it |
|---|---|---|
| `code-review` | Reviews changes on two axes: your repo's coding standards and what the spec asked for. | A branch or pull request is ready for review. |
| `codebase-design` | Shared vocabulary for designing deep modules with small interfaces. | You're deciding how to shape a module, interface or seam. |
| `diagnosing-bugs` | Reproduces a hard bug with one failing command before fixing it, then adds a regression test. | Something is broken, flaky or slow and the cause isn't obvious. |
| `implement` | Builds a spec or ticket test-first, then reviews and commits it. | A ticket or small spec is ready to be built. |
| `implement-spec` | Builds a whole spec with parallel sub-agents and opens one pull request. | A spec with many tickets is ready and you want it built in one go. |
| `improve-codebase-architecture` | Scans a codebase for places to simplify and shows them as a visual report. | The code feels tangled and you want to know where to start cleaning up. |
| `playwright-cli` | Drives a real browser from the terminal: open pages, click, fill forms, take screenshots. | Claude should test, inspect or automate a website. Needs `npm install -g @playwright/cli`. |
| `resolving-merge-conflicts` | Resolves a merge or rebase conflict by finding out why each side changed. | Git stopped a merge or rebase with conflicts. |
| `setup-pre-commit` | Adds Husky pre-commit hooks for formatting, type checks and tests. | You want checks to run automatically before every commit. |
| `tdd` | Test-driven development, one red-green step at a time. | You want a feature or fix built test-first. |
| `wizard` | Writes an interactive script that walks you through steps only a human can do. | A setup needs you to click through dashboards or paste secrets. |

Part of [Claude Skills](https://skills.garciabaertsch.com), a curated collection of Claude Code skills. This is the directory edition of the `coding` plugin. The full collection, including plugins with hooks and scripts such as the skill suggester, installs from its own marketplace:

```text
/plugin marketplace add https://github.com/iatee/claude-skills.git
```

## Credits

- [Matt Pocock](https://github.com/mattpocock/skills) (MIT)
- [Microsoft](https://github.com/microsoft/playwright-cli) (Apache-2.0)

Skills by other authors keep their license file in their folder.
