#!/usr/bin/env node
// SessionStart hook: describe the milestones to Claude once, so it recognizes them in any wording or
// language. suggest.mjs still matches the listed phrases on every prompt, as the guaranteed path.

import fs from "node:fs";
import path from "node:path";
import { CMD, STATE_DIR, findSkill, loadIndex } from "./index.mjs";

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
if (lines.length === 0) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: [
        `Skill suggester: when a user message signals one of these moments, in any wording, language or spelling, add one short line before doing what was asked, such as "💡 Before you go: ${CMD}<skill> for <what>." Name only skills not yet used this session. Once per moment per session, and not if a Skill suggester note already raised it. Never run them unasked. They are installed: the user starts them by typing the command, and skills only the user can start are hidden from your skill list, so a skill missing from that list is no reason to skip it.`,
        ...lines,
      ].join("\n"),
    },
  }),
);
