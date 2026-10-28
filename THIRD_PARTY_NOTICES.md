# Third-party notices

This repository redistributes skills written by other people, under the terms of their licenses.
Each vendored skill folder also contains its upstream license file.
This file is generated from `manifest.json` by `scripts/vendor.mjs`; do not edit it by hand.

## Matt Pocock

- **Upstream:** https://github.com/mattpocock/skills
- **Commit:** [`49dd158`](https://github.com/mattpocock/skills/tree/49dd158d1076134a641b33efb035946536778336)
- **License:** MIT
- **Skills:** `grilling`, `grill-me`, `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`, `to-questionnaire`, `wayfinder`, `prototype`, `triage`, `research`, `setup-matt-pocock-skills`, `implement`, `implement-spec`, `tdd`, `diagnosing-bugs`, `code-review`, `codebase-design`, `improve-codebase-architecture`, `resolving-merge-conflicts` (no longer upstream; copy from an earlier release), `setup-pre-commit`, `wizard`, `writing-for-agents`, `writing-fragments`, `writing-shape`, `teach`, `wait-what`, `handoff`, `claude-handoff`, `retro`
- **Changes to `wayfinder`:** Calls `planning:prototype`, vendored alongside it, so another plugin's `prototype` skill can't answer instead.
- **Changes to `implement`:** Calls `coding:code-review` instead of `code-review`, which Claude Code's built-in review command shadows.
- **Changes to `implement-spec`:** Calls `coding:code-review` instead of `code-review`, which Claude Code's built-in review command shadows.
- **Changes to `tdd`:** Points to `coding:code-review` instead of `code-review`, which Claude Code's built-in review command shadows.

## Paul Bakaus

- **Upstream:** https://github.com/pbakaus/impeccable
- **Commit:** [`6af45ac`](https://github.com/pbakaus/impeccable/tree/6af45ac9a5eb8792f033d3242f52e99812fd91fa)
- **License:** Apache-2.0
- **Skills:** `impeccable`
- Includes upstream `NOTICE.md`, which credits further authors.

## Microsoft

- **Upstream:** https://github.com/microsoft/playwright-cli
- **Commit:** [`b85c7a7`](https://github.com/microsoft/playwright-cli/tree/b85c7a736bb473bf55b584e54a09ffa698d6d871)
- **License:** Apache-2.0
- **Skills:** `playwright-cli`
- **Changes to `playwright-cli`:** Added a "Use when" sentence to the description, so Claude knows when to reach for it.

## Claude Council Contributors

- **Upstream:** https://github.com/itshussainsprojects/Claude-Council-Skill
- **Commit:** [`f41cbcb`](https://github.com/itshussainsprojects/Claude-Council-Skill/tree/f41cbcbec0a55bff474861d6234463b00cc49a6d)
- **License:** MIT
- **Skills:** `council`
- **Changes to `council`:** Added `disable-model-invocation: true`, so the seven-persona debate runs only when asked for (or suggested), not on every "should I".

## Eoghan Henn / rebelytics.com

- **Upstream:** https://github.com/rebelytics/one-skill-to-rule-them-all
- **Commit:** [`3463c7c`](https://github.com/rebelytics/one-skill-to-rule-them-all/tree/3463c7c9cd2a2c2745af09c742100ad0b1465a68)
- **License:** CC-BY-4.0
- **Skills:** `task-observer`
- **Changes to `task-observer`:** Copied a subset of the upstream repository: the two PNG logos and repository housekeeping files were left out. Skill content is unchanged.

## Chris Raroque

- **Upstream:** https://github.com/raroque/vibe-security-skill
- **Commit:** [`850938f`](https://github.com/raroque/vibe-security-skill/tree/850938f20f6915e7c3688d85c0a838f7909c87bb)
- **License:** MIT
- **Skills:** `vibe-security`
- **Changes to `vibe-security`:** The description no longer claims every code review, which belongs to the code-review skills. Added a tenth audit step for invented and lookalike dependencies. The rate-limiting example warns that `x-forwarded-for` can be spoofed. Added checks for Supabase views that bypass RLS, command injection, prototype pollution, `Math.random()` tokens and non-constant-time comparisons, password reset and OAuth flows, race conditions on credits and coupons, webhook retries and non-Stripe signatures, and secrets in logs.

## BehiSecc

- **Upstream:** https://github.com/BehiSecc/VibeSec-Skill
- **Commit:** [`0590993`](https://github.com/BehiSecc/VibeSec-Skill/tree/0590993b35ad51961f65a4d01cf1196dfead05bb)
- **License:** Apache-2.0
- **Skills:** `vibesec`
- **Changes to `vibesec`:** Renamed from `VibeSec-Skill` to `vibesec`, because a skill's name must match its folder. The description names the topics it covers, so it loads for code that touches them rather than for any web work. The PHP XXE advice is updated for PHP 8, which deprecated `libxml_disable_entity_loader`.
