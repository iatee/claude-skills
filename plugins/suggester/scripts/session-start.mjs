#!/usr/bin/env node
// SessionStart hook: describe the milestones to Claude once, so it recognizes them in any wording or
// language. suggest.mjs still matches the listed phrases on every prompt, as the guaranteed path.

import fs from "node:fs";
import path from "node:path";
import { CMD, SKILLS_FILE, STATE_DIR, findSkill, loadIndex } from "./index.mjs";

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

const input = readJson(0, {});
const settings = readJson(path.join(STATE_DIR, "settings.json"), {});
if (settings.enabled === false) process.exit(0);

const skills = loadIndex(input.cwd ?? process.cwd());
const milestones = { ...readJson(path.join(import.meta.dirname, "..", "milestones.json"), {}), ...settings.milestones };
const lines = Object.entries(milestones).flatMap(([key, m]) => {
  if (key.startsWith("$")) return [];
  // An entry is an id, a plain name, or a list of alternatives where the first installed one wins.
  const pick = (entry) => [entry].flat().map((name) => findSkill(skills, name)).find(Boolean);
  const picked = [...new Set(m.skills.map(pick))].filter(Boolean).slice(0, 4);
  return picked.length ? [`- ${m.message} ("Before you ${m.before ?? "continue"}"): ${picked.map((s) => `${CMD}${s.id}`).join(", ")}`] : [];
});
// Sentences up to about 140 characters, cut at a word; a very short opener like "Stop." takes the next one too.
const summary = (text) => {
  let out = "";
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    if (out.length >= 40) break;
    out += (out ? " " : "") + sentence;
  }
  return out.length > 140 ? `${out.slice(0, 140).replace(/\s+\S*$/, "")}…` : out;
};
// Skills only the user can start are hidden from Claude's skill list, so word matching was their only way in.
// Listing them once lets Claude spot a fit in any wording. Preferred marketplaces and the user's own come first.
const prefer = new Set(settings.prefer ?? ["iatee-skills"]);
const seen = new Set();
const preferred = (s) => Number(s.marketplace === null || prefer.has(s.marketplace));
const userOnly = skills
  .filter((s) => s.userOnly)
  .sort((a, b) => preferred(b) - preferred(a))
  .filter((s) => !seen.has(s.name) && seen.add(s.name))
  .slice(0, 25)
  .map((s) => `- ${CMD}${s.id}: ${summary(s.description)}`);
// The list of installed skills, kept current for the user. Its first line records the suggester version that
// wrote it, so the first session after an install or update can point the user to it once.
const version = readJson(path.join(import.meta.dirname, "..", ".claude-plugin", "plugin.json"), {}).version ?? "";
let previous = "";
try {
  previous = fs.readFileSync(SKILLS_FILE, "utf8").split("\n")[0];
} catch {}
// This collection and the user's own skills first, Claude Code's built-ins last, the rest alphabetically.
const rank = (s) => (s.marketplace === "claude-code" ? 2 : preferred(s) ? 0 : 1);
const groups = new Map();
for (const s of [...skills].sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id))) {
  const label = { "claude-code": "Built into Claude Code", "claude.ai": "From claude.ai" }[s.marketplace] ?? "Your own skills";
  const group = s.id.includes(":") ? s.id.split(":")[0] : label;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(`- \`${CMD}${s.id}\`${s.userOnly ? " (you start it)" : ""}: ${summary(s.description)}`);
}
const header = `<!-- suggester ${version} -->`;
fs.mkdirSync(STATE_DIR, { recursive: true });
fs.writeFileSync(
  SKILLS_FILE,
  [
    header,
    "# Your installed skills",
    "",
    `${skills.length} skills, updated ${new Date().toISOString().slice(0, 10)}. Type a command to start one. Claude also uses the others on its own when they fit; the ones marked "you start it" only run when you type them.`,
    ...[...groups].flatMap(([group, entries]) => ["", `## ${group}`, "", ...entries]),
    "",
  ].join("\n"),
);

const context = [];
if (previous !== header) {
  context.push(
    `Skill suggester ${version} was just installed or updated. At the end of your first reply, add one line: "💡 Your ${skills.length} installed skills are listed in ${SKILLS_FILE}; ${CMD}suggester skills shows them."`,
  );
}
if (lines.length) {
  context.push(
    `Skill suggester: when a user message signals one of these moments, in any wording, language or spelling, add one short line before doing what was asked, such as "💡 Before you go: ${CMD}<skill> for <what>." Name only skills not yet used this session. Once per moment per session, and not if a Skill suggester note already raised it. Never run them unasked. They are installed: the user starts them by typing the command, and skills only the user can start are hidden from your skill list, so a skill missing from that list is no reason to skip it.`,
    ...lines,
  );
}
if (userOnly.length) {
  context.push(
    `Skill suggester: these installed skills only the user can start, so they are missing from your skill list. When a request clearly fits one, in any wording or language, add one short line to your reply, such as "💡 ${CMD}<skill> could help here: <why>." At most one per reply, each at most once per session, not if a Skill suggester note already named a skill for that message, and never for small or routine requests.`,
    ...userOnly,
  );
}

if (context.length === 0) process.exit(0);
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context.join("\n") } }));
