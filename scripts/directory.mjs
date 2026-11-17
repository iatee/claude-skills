#!/usr/bin/env node
// Builds the Markdown-only copies of plugins that are submitted to Anthropic's plugin directory,
// into directory/<name>. The directory accepts only Markdown, text, JSON, YAML and images from
// organizations it hasn't verified, so these copies drop or rewrite everything else. The
// marketplace keeps installing the full plugins from plugins/.
//
//   node scripts/directory.mjs           Rebuild directory/.
//   node scripts/directory.mjs --check   Fail if directory/ is out of date (CI).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadCatalog } from "./catalog-data.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");

// Directory names have to be unique across all publishers, so each copy carries the iatee- prefix.
// wrap: shell templates Claude copies into the user's project become Markdown with the script in a code block.
const EDITIONS = {
  "iatee-planning": { from: "planning" },
  "iatee-coding": {
    from: "coding",
    wrap: ["skills/wizard/template.sh", "skills/diagnosing-bugs/scripts/hitl-loop.template.sh"],
    patches: [
      { file: "skills/wizard/SKILL.md", find: "[template.sh](template.sh)", replace: "the script in [template.md](template.md)" },
      { file: "skills/wizard/SKILL.md", find: "Copy `template.sh` to the target path.", replace: "Write the script from `template.md` to the target path exactly as it is, and make it executable." },
      { file: "skills/diagnosing-bugs/SKILL.md", find: "drive _them_ with `scripts/hitl-loop.template.sh`", replace: "drive _them_ with the script in `scripts/hitl-loop.template.md`" },
      { file: "skills/diagnosing-bugs/SKILL.md", find: "only via `scripts/hitl-loop.template.sh`", replace: "only via the script in `scripts/hitl-loop.template.md`" },
      // Tool permissions beyond reading are Verified-only; without the line, Claude Code asks before each command.
      { file: "skills/playwright-cli/SKILL.md", find: "allowed-tools: Bash(playwright-cli:*) Bash(npx playwright:*) Bash(npx --no-install playwright:*)\n", replace: "" },
    ],
  },
  "iatee-security": { from: "security" },
  "iatee-sessions": { from: "sessions" },
  "iatee-writing": { from: "writing" },
  "iatee-pwa": {
    from: "frontend",
    skills: ["pwa"],
    description: "Turn a web app into a Progressive Web App: installable on phones and desktops, an iPhone-app look, offline support and clean updates.",
    license: "MIT", // frontend's Apache-2.0 is impeccable's, which this copy leaves out
  },
};

const ALLOWED = /\.(md|txt|json|ya?ml|png|jpe?g|gif|webp|ico)$/i;
const ALWAYS = /^(LICENSE|NOTICE|README)(\.(md|txt))?$/;

function build(out) {
  fs.rmSync(out, { recursive: true, force: true });
  const { rows } = loadCatalog(ROOT);
  for (const [name, edition] of Object.entries(EDITIONS)) {
    const src = path.join(ROOT, "plugins", edition.from);
    const dest = path.join(out, name);
    const skills = edition.skills ?? fs.readdirSync(path.join(src, "skills")).filter((s) => !s.startsWith("."));
    for (const skill of skills) {
      fs.cpSync(path.join(src, "skills", skill), path.join(dest, "skills", skill), { recursive: true, filter: (p) => path.basename(p) !== ".DS_Store" });
    }
    for (const file of edition.wrap ?? []) {
      const from = path.join(dest, file);
      const to = from.replace(/\.sh$/, ".md");
      const script = fs.readFileSync(from, "utf8");
      fs.writeFileSync(to, `# ${path.basename(file)}\n\nWrite this script out exactly as it is before using it.\n\n\`\`\`bash\n${script.trimEnd()}\n\`\`\`\n`);
      fs.rmSync(from);
    }
    for (const { file, find, replace } of edition.patches ?? []) {
      const target = path.join(dest, file);
      const text = fs.readFileSync(target, "utf8");
      if (!text.includes(find)) throw new Error(`${name}: patch for ${file} no longer applies: "${find}"`);
      fs.writeFileSync(target, text.replace(find, replace));
    }

    const plugin = JSON.parse(fs.readFileSync(path.join(src, ".claude-plugin", "plugin.json"), "utf8"));
    const manifest = { ...plugin, name, description: edition.description ?? plugin.description, license: edition.license ?? plugin.license };
    delete manifest.dependencies; // the directory doesn't install other plugins along with this one
    fs.mkdirSync(path.join(dest, ".claude-plugin"), { recursive: true });
    fs.writeFileSync(path.join(dest, ".claude-plugin", "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");

    const own = rows.filter((r) => r.plugin === edition.from && skills.includes(r.name));
    const credits = [...new Map(own.map((r) => [r.author.name, r.author])).values()];
    fs.writeFileSync(
      path.join(dest, "README.md"),
      [
        `# ${name}`,
        "",
        manifest.description,
        "",
        "| Skill | What it does | When to use it |",
        "|---|---|---|",
        ...own.map((r) => `| \`${r.name}\` | ${r.what} | ${r.when} |`),
        "",
        `Part of [Claude Skills](${plugin.homepage}), a curated collection of Claude Code skills. This is the directory edition of the \`${edition.from}\` plugin. ` +
          "The full collection, including plugins with hooks and scripts such as the skill suggester, installs from its own marketplace:",
        "",
        "```text",
        "/plugin marketplace add https://github.com/iatee/claude-skills.git",
        "```",
        "",
        "## Credits",
        "",
        ...credits.map((a) => `- [${a.name}](${a.url})${a.license ? ` (${a.license})` : ""}`),
        "",
        "Skills by other authors keep their license file in their folder.",
        "",
      ].join("\n"),
    );
  }

  // The directory refuses the whole version for one file of another type, so stop here instead.
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  for (const file of walk(out)) {
    const head = fs.readFileSync(file).subarray(0, 2).toString();
    if (!(ALLOWED.test(file) || ALWAYS.test(path.basename(file))) || head === "#!") throw new Error(`${path.relative(out, file)} isn't allowed in the directory`);
  }
}

const target = path.join(ROOT, "directory");
if (process.argv.includes("--check")) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "directory-"));
  build(tmp);
  try {
    execFileSync("git", ["diff", "--no-index", "--stat", target, tmp], { stdio: "inherit" });
  } catch {
    console.error("✗ directory/ is out of date: run node scripts/directory.mjs");
    process.exit(1);
  }
  console.log("✔ directory/ is up to date");
} else {
  build(target);
  console.log(`wrote ${Object.keys(EDITIONS).map((n) => `directory/${n}`).join(", ")}`);
}
