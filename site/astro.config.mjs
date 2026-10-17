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

// Tables get explicit ARIA roles, so they stay tables for screen readers when CSS changes their
// display, as the catalog's stacked rows do in a narrow column.
const TABLE_ROLES = { table: "table", thead: "rowgroup", tbody: "rowgroup", tr: "row", th: "columnheader", td: "cell" };
function tableRoles() {
  const walk = (node) => {
    if (node.type === "element" && node.tagName in TABLE_ROLES) node.properties.role = TABLE_ROLES[node.tagName];
    node.children?.forEach(walk);
  };
  return walk;
}

export default defineConfig({
  site: "https://skills.garciabaertsch.com",
  markdown: { remarkPlugins: [guideLinks], rehypePlugins: [tableRoles] },
  integrations: [
    starlight({
      title: "Claude Skills",
      description: "A curated set of Claude Code skills, credited to their authors, with guides for beginners and power users.",
      favicon: "/favicon.svg",
      logo: { src: "./src/assets/logo.svg" },
      components: { PageTitle: "./src/components/PageTitle.astro" },
      // Fonts are served from this site (Latin subset only), so pages make no third-party requests.
      customCss: [
        "@fontsource/schibsted-grotesk/latin-400.css",
        "@fontsource/schibsted-grotesk/latin-500.css",
        "@fontsource/schibsted-grotesk/latin-600.css",
        "@fontsource/jetbrains-mono/latin-400.css",
        "@fontsource/jetbrains-mono/latin-500.css",
        "./src/styles/theme.css",
      ],
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
