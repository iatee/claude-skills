# Design

The website (skills.garciabaertsch.com) follows the category standard for developer documentation, held to the craft level of Linear and Stripe Docs. It is familiar and restrained on purpose.

## Colour

Cool neutral greys with two hues, each tied to one role. Indigo means *act*: links, focus rings, the current sidebar item and the primary action (the install Copy button). Amber means *hint*: it belongs to the suggester, so it marks the suggester line in the landing page's example exchange and the quoted suggester lines (blockquotes) in the guides. Neither hue is used for decoration.

| Token | Light | Dark |
|---|---|---|
| Ground | `#fbfbfc` | `#0b0b0d` |
| Surface (raised panels) | `#ffffff` | `#121215` |
| Subtle fill | `#f4f4f6` | `#18181c` |
| Text / secondary / tertiary | `#18181b` / `#52525b` / `#6b6b74` | `#ededf0` / `#a1a1aa` / `#8b8b94` |
| Hairline | `#e4e4e7` | `#232328` |
| Accent (act) | `#4f46e5` | `#8b8cf8` |
| Hint text / fill / hairline | `#8a4b08` / `#fdf7e8` / `#e6c983` | `#f0bf63` / `#1e1910` / `#4a3a1a` |

Semantic roles, each a text colour on a soft fill with a hairline of the same hue. In Starlight they map onto its hue tokens: note → `blue`, tip → `purple` (set to the amber hint), caution → `orange`, danger → `red`, success → `green`.

| Role | Light text / fill / hairline | Dark text / fill / hairline |
|---|---|---|
| Note | `#4338ca` / `#eef0ff` / `#d9dcfb` | `#a5a6fb` / `#1d1d3a` / `#2d2d55` |
| Success | `#15803d` / `#ecfdf3` / `#bfe8cf` | `#4ade80` / `#0f1f16` / `#1f3a2a` |
| Caution | `#c2410c` / `#fff3ec` / `#fbd5c0` | `#fb8f5a` / `#24150d` / `#44261a` |
| Danger | `#b91c1c` / `#fef2f2` / `#f6cfcf` | `#f87171` / `#241112` / `#452023` |

Success confirms a copy: the install button turns green with "Copied", and a plugin's command turns green with a check. Every text pair above passes WCAG AA (4.5:1) on its own fill.

Light or dark follows the system setting. The docs offer a manual switch, and the landing page follows the choice made there. Landing tokens hold both values with `light-dark()`.

## Type

- **Schibsted Grotesk** (400, 500, 600) for everything. Headlines are 600 with tight tracking (−0.035em for page titles, −0.02em for section headings).
- **JetBrains Mono** only for commands, skill and plugin names, and code. Never as decoration.
- Both are served from the site (Fontsource, Latin subset), never from a third-party font host.

## Shape and depth

- 1px hairlines separate everything; no heavy borders or coloured side bars.
- Radii: 8px for panels, tables and code blocks; 6px for buttons and sidebar items; 5px for inline code and badges.
- Only raised panels (install box, example exchange) get a soft, offset shadow.

## Components

- **Install panel:** header row with a label and the one filled button on the page; commands listed with a `›` prompt.
- **Plugin rows:** hairline-separated list, name in mono, one-sentence description, skill count and authors, and a copyable install command per row.
- **Badges:** outlined, small, for states like Opt-in.
- **Asides:** a 1px hairline box on the soft fill of their role, 8px radius, never a thick side bar.
- **Docs:** Starlight, restyled in `site/src/styles/theme.css` to the same tokens: small muted sidebar labels, the current page shown by accent text on a soft accent fill, hairline-ruled h2 sections, tables with a filled header row that hug their content up to the column width. The catalog page (the one page without "On this page") widens to fit its six-column table while its prose keeps the 46rem measure; in a narrow column the catalog's rows stack, each cell under a small label.

## Avoid

Eyebrow labels, stat strips, equal card grids, fake window chrome, pill buttons, serif-italic display type, gradient text, and decorative monospace. impeccable's detector (`impeccable detect`) should report nothing for `site/`.
