# Plan

Settled in a grilling session on 2026-10-16. This is the source of truth for scope; change it here before changing direction.

## Goal

A public repo, `github.com/iatee/claude-skills`, that collects the Claude Code skills worth using, adds skills of our own, and teaches friends and family how to use them. Everything is in English and should look professional.

Done means: the skills are pushed to GitHub, installable as a plugin marketplace, and each one is analysed in the catalog.

## Skills

- **Pool:** the 34 skills in `~/.claude/skills` at import time. No plugin skills in v1.
- **Cut rules.** A skill is cut if it:
  1. duplicates another skill,
  2. is broken or empty, or
  3. is beaten by a better alternative.

  The cut list is approved by the owner before anything is removed. Cut skills are listed in the README under "Not included, and why".
- **Licensing.** All imported skills are permissively licensed and copied with attribution:

  | Upstream | Author | License |
  |---|---|---|
  | mattpocock/skills | Matt Pocock | MIT |
  | pbakaus/impeccable | Paul Bakaus (+ ehmo for `reference/ios.md`, `reference/android.md`, MIT) | Apache-2.0 |
  | thedotmack/claude-mem | Alex Newman (thedotmack) | Apache-2.0 |
  | rebelytics/one-skill-to-rule-them-all | Eoghan Henn / rebelytics.com | CC-BY-4.0 |
  | davila7/claude-code-templates | Daniel Avila | MIT |

  Each copied skill keeps its license file. Modified Apache/CC-BY files are marked as changed.
- **Updates.** Copies are frozen. `manifest.json` records each skill's upstream repo, path and commit; it generates `THIRD_PARTY_NOTICES.md`. A `sync` script, run by hand now and then, shows upstream diffs to accept or reject.
- **Own skills** live in this repo; the owner installs them from this marketplace like everyone else.

## Packaging

A Claude Code plugin marketplace with themed plugins (`planning`, `coding`, `design`, `writing`, `memory`, `suggester`) plus an `all` plugin. Plugins are versioned; changes go in `CHANGELOG.md`. A GitHub Action validates `SKILL.md` frontmatter and the marketplace files.

## Skill suggester (own skill)

Suggests the right skill at the right moment so nobody has to remember every skill.

- A Node `UserPromptSubmit` hook. Works on macOS and Windows.
- Reads the skills installed on the machine at runtime (`~/.claude/skills`, project `.claude/skills`, installed plugins), cached and rebuilt only when a skill folder changes.
- Keyword-matches the prompt against each skill's name, description and trigger phrases. Passes Claude at most the top 3 above a high threshold; otherwise injects nothing (0 tokens).
- Claude mentions at most one, and only on a clear match. Never re-suggests a skill already suggested or used this session.
- **Suggest** skills that are user-only (`disable-model-invocation: true`) or on an editable "heavy" list (`grill-*`, `wayfinder`, `implement*`, `tdd`, `to-tickets`, ...). Lightweight model-invocable skills are left to Claude to auto-use.
- `/suggester off` and `/suggester on`, persisted.
- If Node is missing: warn once per session, otherwise stay silent.

## Docs

- **Start here** (beginner): installing Claude Code, first session, basics.
- **Using skills** (beginner): what a skill is, installing this marketplace, triggering skills, the catalog.
- **Power user** (advanced): skill workflows (e.g. `grill-me → to-spec → to-tickets → implement`), choosing between similar skills, writing your own skill, hooks and plugins.
- **Catalog** in the README, generated from frontmatter and the manifest. Columns: Skill, Plugin, What it does, Use it when, How it's triggered, Credit.

## Website

Astro Starlight built from the same Markdown, with a polished, clean custom landing page. Hosted on GitHub Pages at `skills.garciabaertsch.com` (Cloudflare DNS: CNAME `skills` → `iatee.github.io`, DNS only).

## Build order

1. Skeleton, manifest, copied skills with licenses.
2. Analysis and cut list (owner approves).
3. Marketplace, GitHub Action, first push.
4. Suggester.
5. Guides.
6. Website.
