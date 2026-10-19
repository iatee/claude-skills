// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import { execFileSync } from "node:child_process";

// Each sitemap entry gets a lastmod: the date of the last commit that touched the files the page
// is built from. The home page is built from the catalog and the plugin list, a guide from its file.
// Needs the full history (fetch-depth: 0 in the workflow); without git the entry has no lastmod.
const SOURCES = { "": ["site/src/pages/index.astro", "catalog.json", "manifest.json", ".claude-plugin"] };
function lastCommitDate(files) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...files], { cwd: "..", encoding: "utf8" }).trim();
    return date || undefined;
  } catch {
    return undefined;
  }
}
function withLastmod(item) {
  const slug = new URL(item.url).pathname.replace(/^\/|\/$/g, "");
  // A skill page is built from the catalog entries and the skill's own folder.
  const skill = slug.match(/^skills\/(.+)$/)?.[1];
  const files = skill ? ["catalog.json", "manifest.json", `:(glob)plugins/*/skills/${skill}`] : SOURCES[slug] ?? [`docs/guides/${slug}.md`];
  const lastmod = lastCommitDate(files);
  return lastmod ? { ...item, lastmod } : item;
}

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
    // Listed here so Starlight uses this one (with lastmod) instead of adding its own.
    sitemap({ serialize: withLastmod }),
    starlight({
      title: "Claude Skills",
      description: "A curated set of Claude Code skills, credited to their authors, with guides for beginners and power users.",
      favicon: "/favicon.svg",
      // Shell snippets render as plain code blocks, not as a fake terminal window with three dots.
      expressiveCode: { defaultProps: { frame: "code" } },
      logo: { light: "./src/assets/logo-light.svg", dark: "./src/assets/logo-dark.svg" },
      components: { Head: "./src/components/Head.astro", PageTitle: "./src/components/PageTitle.astro", Footer: "./src/components/Footer.astro" },
      // Fonts are served from this site (Latin subset only), so pages make no third-party requests.
      // The share image for every guide; Starlight already sets the large-image card type.
      head: [
        { tag: "meta", attrs: { property: "og:image", content: "https://skills.garciabaertsch.com/og.png" } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        {
          tag: "meta",
          attrs: { property: "og:image:alt", content: "Claude Skills: curated skills for Claude Code, with an example suggester line." },
        },
        { tag: "meta", attrs: { name: "twitter:image", content: "https://skills.garciabaertsch.com/og.png" } },
      ],
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
