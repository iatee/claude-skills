// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// The guides live in ../docs/guides and link to each other as `catalog.md`, which works on
// GitHub. On the site every guide is its own page, so rewrite those links to `../catalog/`.
function guideLinks() {
  const walk = (node) => {
    if (node.type === "link") {
      const match = node.url.match(/^([a-z0-9-]+)\.md(#.*)?$/);
      if (match) node.url = `../${match[1]}/${match[2] ?? ""}`;
    }
    node.children?.forEach(walk);
  };
  return walk;
}

export default defineConfig({
  site: "https://skills.garciabaertsch.com",
  markdown: { remarkPlugins: [guideLinks] },
  integrations: [
    starlight({
      title: "Claude Skills",
      description: "A curated set of Claude Code skills, credited to their authors, with guides for beginners and power users.",
      favicon: "/favicon.svg",
      head: [
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true } },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
          },
        },
      ],
      customCss: ["./src/styles/theme.css"],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/iatee/claude-skills" }],
      editLink: { baseUrl: "https://github.com/iatee/claude-skills/edit/main/" },
      sidebar: [
        {
          label: "Get started",
          items: [
            { label: "Start here", link: "/start-here/" },
            { label: "Using skills", link: "/using-skills/" },
            { label: "Skill catalog", link: "/catalog/" },
          ],
        },
        {
          label: "Go further",
          items: [
            { label: "Power user", link: "/power-user/" },
            { label: "Customize Claude Code", link: "/customize/" },
            { label: "Your own Claude server", link: "/own-server/" },
          ],
        },
      ],
    }),
  ],
});
