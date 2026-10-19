// The catalog rows, read from catalog.json, each SKILL.md, manifest.json and the marketplace.
// Shared by scripts/catalog.mjs (README and catalog tables) and the site's per-skill pages,
// so both always describe the same skills. Pass the repository root.

import fs from "node:fs";
import path from "node:path";

export function loadCatalog(root) {
  const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
  const catalog = JSON.parse(read("catalog.json"));
  const manifest = JSON.parse(read("manifest.json"));
  const marketplace = JSON.parse(read(".claude-plugin/marketplace.json"));

  const pluginOrder = marketplace.plugins.map((p) => p.name);
  const errors = [];

  const frontmatter = (file) => fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const field = (fm, key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1].trim().replace(/^["']|["']$/g, "");

  // Who to credit, as a name and a link. Skills not vendored from elsewhere are Iatee's own.
  function author(name) {
    const vendored = manifest.skills[name];
    if (!vendored) return { name: "Iatee", url: "https://github.com/iatee/claude-skills", license: "MIT" };
    const source = manifest.sources[vendored.source];
    return { name: source.author, url: `https://github.com/${source.repo}`, license: source.license };
  }

  const rows = [];
  for (const plugin of pluginOrder) {
    const dir = path.join(root, "plugins", plugin, "skills");
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      const entry = catalog.skills[name];
      if (!entry) {
        errors.push(`catalog.json has no entry for ${name}`);
        continue;
      }
      const fm = frontmatter(path.join(dir, name, "SKILL.md"));
      const userOnly = /^disable-model-invocation:\s*true\s*$/m.test(fm);
      const by = author(name);
      rows.push({
        name,
        plugin,
        ...entry,
        trigger: entry.trigger ?? (userOnly ? `\`/${name}\`` : `Automatic, or \`/${name}\``),
        credit: by.name === "Iatee" ? "Iatee" : `[${by.name}](${by.url})`,
        author: by,
        description: field(fm, "description") ?? "",
        pack: false,
      });
    }
  }
  for (const [name, entry] of Object.entries(catalog.referenced)) {
    const m = entry.credit.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    rows.push({ name, plugin: name, ...entry, author: { name: m[1], url: m[2], license: "" }, description: "", pack: true });
  }
  rows.sort((a, b) => pluginOrder.indexOf(a.plugin) - pluginOrder.indexOf(b.plugin));

  return { rows, errors, marketplace: marketplace.name };
}
