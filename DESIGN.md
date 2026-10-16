# Design

The website (skills.garciabaertsch.com) follows the category standard for developer documentation, held to the craft level of Linear and Stripe Docs. It is familiar and restrained on purpose.

## Colour

Restrained: cool neutral greys plus one indigo accent. The accent is reserved for links, focus rings, the current sidebar item and the primary action (the install Copy button).

| Token | Light | Dark |
|---|---|---|
| Ground | `#fbfbfc` | `#0b0b0d` |
| Surface (raised panels) | `#ffffff` | `#121215` |
| Subtle fill | `#f4f4f6` | `#18181c` |
| Text / secondary / tertiary | `#18181b` / `#52525b` / `#71717a` | `#ededf0` / `#a1a1aa` / `#8b8b94` |
| Hairline | `#e4e4e7` | `#232328` |
| Accent | `#4f46e5` | `#8b8cf8` |

Light or dark follows the system setting; the docs also offer a manual switch.

## Type

- **Schibsted Grotesk** (400, 500, 600) for everything. Headlines are 600 with tight tracking (−0.035em for page titles, −0.02em for section headings).
- **JetBrains Mono** only for commands, skill and plugin names, and code. Never as decoration.

## Shape and depth

- 1px hairlines separate everything; no heavy borders or coloured side bars.
- Radii: 8px for panels, tables and code blocks; 6px for buttons and sidebar items; 5px for inline code and badges.
- Only raised panels (install box, example exchange) get a soft, offset shadow.

## Components

- **Install panel:** header row with a label and the one filled button on the page; commands listed with a `›` prompt.
- **Plugin rows:** hairline-separated list, name in mono, one-sentence description, skill count and authors, and a copyable install command per row.
- **Badges:** outlined, small, for states like Opt-in.
- **Docs:** Starlight, restyled in `site/src/styles/theme.css` to the same tokens: small muted sidebar labels, the current page shown by accent text on a soft accent fill, hairline-ruled h2 sections, tables with a filled header row.

## Avoid

Eyebrow labels, stat strips, equal card grids, fake window chrome, pill buttons, serif-italic display type, gradient text, and decorative monospace. impeccable's detector (`impeccable detect`) should report nothing for `site/`.
