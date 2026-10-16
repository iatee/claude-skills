#!/usr/bin/env node
// UserPromptSubmit hook: if an installed skill clearly fits the prompt, tell Claude about it.
// Prints nothing (zero tokens) when nothing scores above the threshold.

import fs from "node:fs";
import path from "node:path";
import { STATE_DIR, loadIndex, score } from "./index.mjs";

const THRESHOLD = 7;
const MAX_CANDIDATES = 3;
const DEFAULT_HEAVY = ["grill", "wayfinder", "implement", "tdd", "to-tickets", "to-spec", "triage", "improve-codebase-architecture"];

const settingsFile = path.join(STATE_DIR, "settings.json");
const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
};

const input = JSON.parse(fs.readFileSync(0, "utf8"));
const prompt = (input.prompt ?? "").trim();
const settings = readJson(settingsFile, {});

// `/suggester on|off` is handled here, so it works instantly and costs nothing.
const toggle = prompt.match(/^\/(?:suggester:)?suggester\s+(on|off)\b/i);
if (toggle) {
  writeJson(settingsFile, { ...settings, enabled: toggle[1].toLowerCase() === "on" });
  process.exit(0);
}
if (settings.enabled === false || prompt.startsWith("/") || prompt.split(/\s+/).length < 4) process.exit(0);

// Skills already suggested this session, or already used, stay quiet.
const sessionFile = path.join(STATE_DIR, "sessions", `${input.session_id ?? "unknown"}.json`);
const shown = new Set(readJson(sessionFile, []));
let transcript = "";
try {
  transcript = fs.readFileSync(input.transcript_path, "utf8");
} catch {}
const used = (id) => transcript.includes(`"skill":"${id}"`) || transcript.includes(`<command-name>/${id}<`);

const heavy = settings.heavy ?? DEFAULT_HEAVY;
const isHeavy = (s) => s.userOnly || heavy.some((h) => s.name === h || s.name.startsWith(`${h}-`));

const triggers = readJson(path.join(import.meta.dirname, "..", "triggers.json"), {});
for (const [name, words] of Object.entries(settings.triggers ?? {})) triggers[name] = [...(triggers[name] ?? []), ...words];

const candidates = score(prompt, loadIndex(input.cwd ?? process.cwd()), triggers)
  .filter((r) => r.score >= THRESHOLD && !shown.has(r.skill.id) && !used(r.skill.id) && !used(r.skill.name))
  .slice(0, MAX_CANDIDATES);
if (candidates.length === 0) process.exit(0);

for (const { skill } of candidates) shown.add(skill.id);
writeJson(sessionFile, [...shown]);

const lines = candidates.map(({ skill }) => {
  const how = isHeavy(skill) ? "suggest to the user" : "you may use it yourself";
  return `- /${skill.id} (${how}): ${skill.description.slice(0, 240)}`;
});
const context = [
  "Skill suggester: these installed skills might fit this request.",
  ...lines,
  "Only act if one is a clear, strong fit; otherwise ignore this note entirely and do not mention it.",
  'For "suggest to the user": add one short line to your reply, such as "💡 /<name> could help here: <why>". Never run it unasked.',
  'For "you may use it yourself": use the skill if it helps, without announcing it.',
  "Mention at most one skill.",
].join("\n");

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context } }));
