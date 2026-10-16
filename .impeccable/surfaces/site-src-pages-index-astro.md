---
version: 1
slug: "site-src-pages-index-astro"
primary_target: "site/src/pages/index.astro"
related_targets: ["site/src/styles/theme.css"]
---

# Landing page: skills.garciabaertsch.com

Scope: site/src/pages/index.astro (Persuade). The docs theme (site/src/styles/theme.css) shares this system in Read mode.

Audience and job: newcomers and experienced Claude Code users decide to install, and copy the install commands. Proof is the real thing: real commands, real plugin list, a real suggester exchange, real author credits.

## Direction contract

THESIS: The category standard for developer docs, done at Linear and Stripe Docs craft. Refuses the AI landing template: no eyebrow labels, stat strip, equal card grid, fake terminal chrome, pill buttons or serif-italic hero.

OWN-WORLD: Restrained colour: cool neutral greys (near-white ground in light, near-black in dark), indigo used only for links, focus and the primary action, and amber used only for the suggester's hint line. Schibsted Grotesk for everything, JetBrains Mono only for commands and skill names. 1px hairline borders, 8px radii, soft offset shadows only on raised panels.

STORY: The visitor learns what this is in one line, sees the install commands and copies them, sees what the suggester does, scans the plugins with their own install commands, then reaches a guide.

FIRST VIEWPORT: Left column: one-line headline, one-sentence description, the install command panel with a copy button as the primary action, and a quiet "Read the guide" link. Right column: a Claude Code exchange showing a real suggester line. Stacks on phones, install panel first.

FORM: Category standard (canon), chosen by the user. seed:4727765325f4fcc2

SIGNATURE: The install panel copies all three commands in one press and confirms in place; every plugin row has its own one-line install command.
