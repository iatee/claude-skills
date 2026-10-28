# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Friends and family new to Claude Code.** They want to get set up, learn the basics, and install good skills without understanding plugins or marketplaces first.
- **Experienced Claude Code users, including the owner.** They want better skills, workflows that chain them, and the more advanced material (mods, status lines, memory, running Claude Code on a server).

## Product Purpose

A curated, public collection of Claude Code skills at skills.garciabaertsch.com, backed by the GitHub repository iatee/claude-skills. It lets people install a hand-picked set of skills in one step, learn Claude Code through six guides, and stop having to remember which skill fits when. Success: a newcomer goes from nothing to a working setup with skills, and an experienced user finds skills and techniques worth adopting.

## Positioning

- Hand-picked rather than exhaustive: skills are included, cut, or linked for stated reasons ("Not included, and why").
- Every third-party skill is credited to its original author and keeps its license.
- A built-in skill suggester tells the user when an installed skill fits what they are doing, so nobody has to memorise the catalog.

## Operating Context

- Installed inside Claude Code with `/plugin marketplace add iatee/claude-skills`, `/plugin install all@iatee-skills`, `/reload-plugins`.
- Distributed as a plugin marketplace (`iatee-skills`) with themed plugins: planning, coding, frontend, security, writing, sessions, suggester, plus opt-in ponytail and observer, and `all`.
- Guides live in `docs/guides/*.md`, render on GitHub and on the site (Astro + Starlight in `site/`). The catalog is generated from `catalog.json`.

## Capabilities and Constraints

- Static site on GitHub Pages; Starlight provides docs, search, navigation and theme switching.
- The landing page and catalog are generated from repository data at build time; counts and lists must stay data-driven.
- Light and dark mode, and phone widths, are required.

## Brand Commitments

- Name: "Claude Skills". It is an unofficial, personal project and must say it is not affiliated with Anthropic.
- Voice: neutral third person. Calm and factual, no "I", no marketing hype.
- Does not share the look of garciabaertsch.com.
- Visual standard (chosen 2026-10-16): the category standard for developer docs, executed at the craft level of Linear and Stripe Docs. No novelty concept; familiar, precise, restrained.

## Evidence on Hand

- Real content: the skill catalog (`catalog.json`, `docs/guides/catalog.md`), the six guides, real install commands, the real suggester output format (`💡 /coding:tdd could help here: …`), and the author credits in `manifest.json` and `THIRD_PARTY_NOTICES.md`.
- No testimonials, user counts, or endorsements exist. None may be invented.

## Product Principles

1. Show the real thing (actual skills, commands, output) instead of describing it.
2. Credit first: authors are always visible and linked.
3. Beginners must never be stuck: every step names the exact command to run.
4. Fewer, better: anything that exists only because "sites usually have it" goes.

## Accessibility & Inclusion

Readers include non-technical family members: plain language, readable type sizes, and full keyboard and screen-reader access.
