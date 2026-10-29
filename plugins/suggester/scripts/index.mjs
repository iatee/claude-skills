// Finds every skill installed on this machine and scores prompts against them.
// Pure Node, no dependencies, so it runs anywhere Claude Code does.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
export const STATE_DIR = path.join(CONFIG_DIR, "skill-suggester");
// Codex runs these hooks with `--codex`: it finds skills in ~/.agents/skills and starts them with `$name`.
export const CODEX = process.argv.includes("--codex");
export const CMD = CODEX ? "$" : "/";

const STOPWORDS = new Set(
  ("the and for with that this from into your you are can when what want wants use uses used user users " +
    "skill skills any all its it's not but has have how who why which will would should could also than then " +
    "them they their there here about some more most other only just like such each very does doing done get " +
    "make made need needs one two out our over own same see via want please let lets i'm i've you're don't " +
    "something anything everything nothing thing things too btw really maybe still never ever now yet way work create add").split(" "),
);

// Light stemming, so "translate" meets "translation" and "fails" meets "failing".
const stem = (w) => (w.length > 4 ? w.replace(/(ions?|ings?|ed|es|ly|e|s)$/, "") : w.replace(/s$/, "")) || w;
// "pull request" is one thing: as two words, "request" matched skills like change-request.
export const tokenize = (text) =>
  (text.toLowerCase().replace(/pull requests?/g, " ").match(/[a-z0-9]+/g) ?? []).filter((w) => w.length > 2 && !STOPWORDS.has(w)).map(stem);

function readFrontmatter(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  let key = null;
  for (const line of match[1].split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (top) {
      key = top[1];
      fields[key] = top[2].replace(/^[>|]-?$/, "").replace(/^["']|["']$/g, "");
    } else if (key && /^\s+\S/.test(line)) {
      fields[key] = `${fields[key]} ${line.trim()}`.trim();
    }
  }
  return fields;
}

const subdirs = (dir) => {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => path.join(dir, d.name));
  } catch {
    return [];
  }
};

// A plugin's skill and command folders: the defaults plus any extra paths its plugin.json lists.
function pluginRoots(pluginDir, plugin, marketplace) {
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(pluginDir, ".claude-plugin", "plugin.json"), "utf8"));
  } catch {}
  const dirs = (field) => [...new Set([field, ...[manifest[field] ?? []].flat()].map((p) => path.resolve(pluginDir, p)))];
  return [...dirs("skills").map((dir) => ({ dir, plugin, marketplace })), ...dirs("commands").map((dir) => ({ dir, plugin, marketplace, commands: true }))];
}

// Each root is a directory of <skill>/SKILL.md folders, or of <command>.md files, with an optional plugin prefix.
// `marketplace` is null for the user's own skill folders.
function skillRoots(cwd) {
  // shortcut: Codex also scans folders between cwd and the repo root; add them if people keep skills there.
  if (CODEX) return [path.join(os.homedir(), ".agents", "skills"), path.join(cwd, ".agents", "skills"), "/etc/codex/skills"].map((dir) => ({ dir, plugin: null }));
  const roots = [
    { dir: path.join(CONFIG_DIR, "skills"), plugin: null },
    { dir: path.join(cwd, ".claude", "skills"), plugin: null },
  ];
  let installed = {};
  let enabled = {};
  try {
    installed = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "plugins", "installed_plugins.json"), "utf8")).plugins ?? {};
  } catch {}
  for (const settings of [path.join(CONFIG_DIR, "settings.json"), path.join(cwd, ".claude", "settings.json")]) {
    try {
      Object.assign(enabled, JSON.parse(fs.readFileSync(settings, "utf8")).enabledPlugins);
    } catch {}
  }
  for (const [id, installs] of Object.entries(installed)) {
    if (enabled[id] === false) continue;
    const [plugin, marketplace] = id.split("@");
    for (const install of installs) roots.push(...pluginRoots(install.installPath, plugin, marketplace));
  }

  // Skills and plugins synced from a claude.ai account sit one bucket folder deeper.
  for (const bucket of subdirs(path.join(CONFIG_DIR, "skills", "synced"))) roots.push({ dir: bucket, plugin: null, marketplace: "claude.ai" });
  for (const bucket of subdirs(path.join(CONFIG_DIR, "plugins", "synced"))) {
    for (const pluginDir of subdirs(bucket)) {
      let plugin = path.basename(pluginDir).replace(/~.*$/, "");
      try {
        plugin = JSON.parse(fs.readFileSync(path.join(pluginDir, ".claude-plugin", "plugin.json"), "utf8")).name || plugin;
      } catch {}
      roots.push(...pluginRoots(pluginDir, plugin, "claude.ai"));
    }
  }
  return roots;
}

const entry = (id, name, description, userOnly = false, marketplace = null) => ({
  id,
  marketplace,
  name,
  description,
  userOnly,
  // The skill's own name only: a plugin name like "coding" would match "code" for every skill in it.
  nameTokens: [...new Set(tokenize(name))],
  descTokens: tokenize(description),
  // Quoted trigger phrases, e.g. Use when the user says "debug this". Single quotes are skipped: they are mostly apostrophes.
  phrases: [...description.matchAll(/["“]([^"”]{4,40})["”]/g)].map((m) => m[1].toLowerCase()).filter((p) => tokenize(p).length > 0),
});

// The session's skill listing in the transcript is what Claude Code actually offers: it gives skills found
// on disk their exact ids (synced skills get a plugin prefix there) and adds the rest, such as Claude Code's
// built-in skills, which have no SKILL.md. Before that listing is written, builtins.json stands in.
// A skill by exact id first, then by plain name, so "code-review" finds the built-in before coding:code-review.
export const findSkill = (skills, name) => skills.find((s) => s.id === name) ?? skills.find((s) => s.name === name);

export const loadIndex = (cwd, transcript = "") => {
  const skills = loadSkillFiles(cwd);
  // Codex has neither Claude Code's built-in skills nor its skill listing.
  if (CODEX) return skills;
  let fallback = {};
  try {
    fallback = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "builtins.json"), "utf8"));
  } catch {}
  delete fallback.$comment;
  // Find the latest listing line without splitting the whole transcript.
  const at = transcript.lastIndexOf('"type":"skill_listing"');
  const end = transcript.indexOf("\n", at);
  const line = at < 0 ? "" : transcript.slice(transcript.lastIndexOf("\n", at) + 1, end < 0 ? undefined : end);
  let names = Object.keys(fallback);
  let described = new Map();
  let fromListing = skills;
  if (line) {
    try {
      const listing = JSON.parse(line).attachment;
      names = listing.names;
      described = new Map([...listing.content.matchAll(/^- ([^\s(]+?)(?: \([^)]*\))?: (.+)$/gm)].map((m) => [m[1], m[2]]));
      const listed = new Set(names);
      const onDisk = new Set(skills.map((s) => s.id));
      fromListing = skills.map((s) => {
        if (listed.has(s.id) || s.id.includes(":")) return s;
        const full = names.find((n) => n.endsWith(`:${s.id}`) && !onDisk.has(n));
        return full ? { ...s, id: full } : s;
      });
    } catch {}
  }
  const have = new Set(fromListing.map((s) => s.id));
  const extra = names
    .filter((n) => !have.has(n) && (described.get(n) ?? fallback[n]))
    .map((n) => entry(n, n.split(":").pop(), described.get(n) ?? fallback[n], false, "claude-code"));
  return [...fromListing, ...extra];
};

// The cache key is every root's mtime, so adding, removing or updating a skill rebuilds the index.
function loadSkillFiles(cwd) {
  const roots = skillRoots(cwd).filter((r) => fs.existsSync(r.dir));
  const key = ["v3", ...roots.map((r) => `${r.dir}:${fs.statSync(r.dir).mtimeMs}`)].join("|");
  const cacheFile = path.join(STATE_DIR, CODEX ? "index-codex.json" : "index.json");
  try {
    const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
    if (cached.key === key) return cached.skills;
  } catch {}

  const skills = [];
  const seen = new Set();
  for (const { dir, plugin, marketplace = null, commands } of roots) {
    let items = [];
    try {
      items = fs.readdirSync(dir);
    } catch {}
    for (const item of items) {
      if (commands && !item.endsWith(".md")) continue;
      const fm = readFrontmatter(commands ? path.join(dir, item) : path.join(dir, item, "SKILL.md"));
      if (!fm?.description) continue;
      // Claude Code names a skill after its folder (or command file), not its frontmatter name.
      const name = commands ? item.slice(0, -3) : item;
      const id = plugin ? `${plugin}:${name}` : name;
      if (seen.has(id) || plugin === "suggester") continue;
      seen.add(id);
      skills.push(entry(id, name, fm.description, fm["disable-model-invocation"] === "true", marketplace));
    }
  }
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify({ key, skills }));
  } catch {}
  return skills;
}

// BM25-style scoring: rare words count more, long descriptions don't win by sheer length,
// and a match on the skill's name or one of its quoted trigger phrases counts most.
export function score(prompt, skills, triggers = {}, weight = () => 1) {
  const words = new Set(tokenize(prompt));
  const lower = ` ${prompt.toLowerCase().replace(/[^a-z0-9.'-]+/g, " ")} `;
  // A phrase also matches with a common ending, so the trigger "crash" matches "crashes" and "crashed".
  const hasPhrase = (p) => ["", "s", "es", "d", "ed", "ing"].some((end) => lower.includes(` ${p.toLowerCase()}${end} `));
  const df = new Map();
  for (const s of skills) for (const t of new Set(s.descTokens)) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLen = skills.reduce((n, s) => n + s.descTokens.length, 0) / Math.max(skills.length, 1);
  const idf = (t) => Math.log(1 + skills.length / (df.get(t) ?? 1));

  return skills
    .map((s) => {
      const desc = new Set(s.descTokens);
      const norm = 0.75 + (0.25 * s.descTokens.length) / avgLen;
      let total = 0;
      let hits = 0;
      let nameHit = false;
      let phraseHit = false;
      for (const w of words) {
        if (s.nameTokens.includes(w)) {
          total += 3 * idf(w);
          nameHit = true;
        }
        if (desc.has(w)) {
          total += idf(w) / norm;
          hits++;
        }
      }
      for (const p of [...s.phrases, ...(triggers[s.name] ?? [])]) {
        if (hasPhrase(p)) {
          total += 6;
          phraseHit = true;
        }
      }
      // A match needs more than one stray word: a trigger phrase, or the name plus the description.
      return { skill: s, score: total * weight(s), confident: phraseHit || (nameHit && hits >= 2) || hits >= 3 };
    })
    .filter((r) => r.confident)
    .sort((a, b) => b.score - a.score)
    .filter((r, _, all) => r.score >= 0.6 * all[0].score);
}
