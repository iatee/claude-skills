#!/usr/bin/env node
// Checks every SKILL.md and that the manifest, plugins and marketplace agree.
// Run by CI; run it locally before pushing: `node scripts/check.mjs`.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const errors = [];
const fail = (msg) => errors.push(msg);

function frontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  let key = null;
  for (const line of match[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (top) {
      key = top[1];
      fields[key] = top[2].replace(/^["']|["']$/g, "");
    } else if (key && /^\s+\S/.test(line)) {
      fields[key] = `${fields[key]} ${line.trim()}`.trim();
    }
  }
  return fields;
}

const marketplace = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin/marketplace.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
const listed = new Set(marketplace.plugins.map((p) => p.name));

for (const dir of fs.readdirSync(path.join(ROOT, "plugins"))) {
  if (!listed.has(dir)) fail(`plugins/${dir} is not listed in marketplace.json`);
  const pluginJson = path.join(ROOT, "plugins", dir, ".claude-plugin/plugin.json");
  if (!fs.existsSync(pluginJson)) {
    fail(`plugins/${dir} has no .claude-plugin/plugin.json`);
    continue;
  }
  const plugin = JSON.parse(fs.readFileSync(pluginJson, "utf8"));
  if (plugin.name !== dir) fail(`plugins/${dir}/plugin.json is named "${plugin.name}"`);
  if (!/^\d+\.\d+\.\d+$/.test(plugin.version ?? "")) fail(`plugins/${dir} needs a semver version`);
  for (const dep of plugin.dependencies ?? []) {
    if (!listed.has(typeof dep === "string" ? dep : dep.name)) fail(`plugins/${dir} depends on unknown plugin ${JSON.stringify(dep)}`);
  }

  const skillsDir = path.join(ROOT, "plugins", dir, "skills");
  if (!fs.existsSync(skillsDir)) continue;
  for (const skill of fs.readdirSync(skillsDir)) {
    const where = `plugins/${dir}/skills/${skill}`;
    const file = path.join(skillsDir, skill, "SKILL.md");
    if (!fs.existsSync(file)) {
      fail(`${where} has no SKILL.md`);
      continue;
    }
    const fm = frontmatter(file);
    if (!fm) fail(`${where}/SKILL.md has no frontmatter`);
    else {
      if (fm.name !== skill) fail(`${where}/SKILL.md name "${fm.name}" does not match its folder`);
      if (!fm.description) fail(`${where}/SKILL.md has no description`);
      else if (fm.description.length > 1024) fail(`${where}/SKILL.md description is over 1024 characters`);
    }
    const vendored = manifest.skills[skill];
    if (vendored && vendored.plugin !== dir) fail(`${where} is listed under plugin "${vendored.plugin}" in manifest.json`);
  }
}

for (const [name, skill] of Object.entries(manifest.skills)) {
  if (!fs.existsSync(path.join(ROOT, "plugins", skill.plugin, "skills", name))) fail(`manifest.json lists ${name}, but it is not vendored`);
}

// Plugins referenced from other repositories need a catalog entry, which the site reads their skill count from.
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "catalog.json"), "utf8"));
for (const p of marketplace.plugins.filter((p) => typeof p.source !== "string")) {
  if (!Number.isInteger(catalog.referenced[p.name]?.skills)) fail(`catalog.json needs a "referenced" entry with a "skills" count for ${p.name}`);
}

// The suggester reads these on every prompt and silently ignores a file that doesn't parse.
for (const file of ["triggers.json", "milestones.json", "builtins.json"]) {
  try {
    JSON.parse(fs.readFileSync(path.join(ROOT, "plugins/suggester", file), "utf8"));
  } catch (error) {
    fail(`plugins/suggester/${file} is not valid JSON: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log("✔ All skills and plugins check out");
