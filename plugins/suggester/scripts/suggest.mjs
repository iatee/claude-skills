#!/usr/bin/env node
// UserPromptSubmit hook: if an installed skill clearly fits the prompt, tell Claude about it.
// Prints nothing (zero tokens) when nothing scores above the threshold.

import fs from "node:fs";
import path from "node:path";
import { CMD, CODEX, SKILLS_FILE, STATE_DIR, findSkill, loadIndex, score } from "./index.mjs";
import { planRun, planStep } from "./plan.mjs";

const THRESHOLD = 7;
const MAX_CANDIDATES = 3;
const PREFER_BOOST = 1.5;
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
const toggle = prompt.match(/^[/$](?:suggester:)?suggester\s+(on|off)\b/i);
if (toggle) {
  writeJson(settingsFile, { ...settings, enabled: toggle[1].toLowerCase() === "on" });
  process.exit(0);
}
if (settings.enabled === false) process.exit(0);

let transcript = "";
try {
  transcript = fs.readFileSync(input.transcript_path, "utf8");
} catch {}

const say = (context) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context } }));
  process.exit(0);
};
if (/^[/$](?:suggester:)?suggester\s+(?:skills|list)\b/i.test(prompt)) {
  say(
    fs.existsSync(SKILLS_FILE)
      ? `Skill suggester: the user wants to see their installed skills. They are listed, grouped by plugin, in ${SKILLS_FILE}. Read it and show each plugin with its skills' commands on one line, marking the ones the user starts themselves. Then say the file has a one-line description of each.`
      : "Skill suggester: the list of installed skills is written when a session starts. Say so in one line and suggest starting a new session.",
  );
}
const cwd = input.cwd ?? process.cwd();
let index;
const skills = () => (index ??= loadIndex(cwd, transcript));

// "Run the plan": Claude runs every step that hasn't run yet, committing after each, without pausing.
// Plans are read from Claude Code's transcript and run with its Skill tool, so Codex skips them.
const run = !CODEX && planRun(prompt, transcript, cwd);
if (run) {
  if (run.total === 0) say("Skill suggester: the user asked to run the plan, but no plan is remembered for this project. Say so in one line.");
  if (run.remaining.length === 0) say("Skill suggester: every step of the remembered plan has already run. Say so in one line.");
  const steps = run.remaining.map((step, i) => {
    const [name, ...args] = step.command.replace(/^\//, "").split(/\s+/);
    const skill = findSkill(skills(), name) ?? findSkill(skills(), name.split(":").pop());
    const how = skill ? ` Skill tool: skill "${skill.id}", args "${args.join(" ")}".` : "";
    return `${i + 1}. \`${step.command}\`${step.note ? `: ${step.note}` : ""}.${how}`;
  });
  say(
    [
      `Skill suggester: the user wants the remembered plan run to the end. ${run.remaining.length} of ${run.total} steps remain, in this order:`,
      ...steps,
      "Run each step in turn with the Skill tool and finish it completely. Then commit the files that step changed, with a message describing what the step did, and go straight on to the next step. Do not pause or ask whether to continue.",
      "Stop early only if a step needs a decision only the user can make, or a build or check fails, and say which step you stopped at; running the plan again continues from there.",
      "At the end, list each step with its commit.",
    ].join("\n"),
  );
}

// Running a step of a numbered plan Claude wrote earlier: have Claude name the next step when it's done.
const step = !CODEX && planStep(prompt, transcript, cwd);
if (step) {
  const next = step.next
    ? `When this step is done, end your reply with one line: "Next step: \`${step.next.command}\`${step.next.note ? ` (${step.next.note})` : ""}."`
    : "This is the last step of that plan. When it is done, say so in one short line.";
  say(`Skill suggester: this prompt runs step ${step.number} of ${step.total} of a plan from earlier (\`${step.step.command}\`). ${next}`);
}

// Skills already suggested this session, or already used, stay quiet.
const sessionFile = path.join(STATE_DIR, "sessions", `${input.session_id ?? "unknown"}.json`);
const shown = new Set(readJson(sessionFile, []));
// One pass over the transcript, rather than a search per skill.
const usedIds = new Set([...transcript.matchAll(/"skill":"([^"]+)"|<command-name>\/([^<\s]+)</g)].map((m) => m[1] ?? m[2]));
const used = (s) => usedIds.has(s.id) || usedIds.has(s.name);

// Milestones, like publishing a site: point to the checks people forget, once per session.
const milestones = { ...readJson(path.join(import.meta.dirname, "..", "milestones.json"), {}), ...settings.milestones };
for (const [key, m] of Object.entries(milestones)) {
  if (key.startsWith("$") || shown.has(`milestone:${key}`)) continue;
  // Letter-aware boundaries, so phrases like "mise en ligne" or "veröffentlichen" match in any language.
  // An English article in a phrase stands for any of them: "create a pr" also matches "create the pr".
  const phrases = m.when.map((p) =>
    p
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/'/g, "['’]")
      .replace(/(?<=^|\s)(?:a|an|the)(?=\s)/g, "(?:a|an|the|my|our|this|that)"),
  );
  const when = new RegExp(`(?<![\\p{L}\\p{N}])(${phrases.join("|")})(?![\\p{L}\\p{N}])`, "iu");
  const context = m.context && new RegExp(m.context, "i");
  if (!when.test(prompt) || (context && !context.test(prompt) && !context.test(transcript))) continue;
  // An entry is an id, a plain name, or a list of alternatives where the first installed one wins.
  const pick = (entry) => [entry].flat().map((name) => findSkill(skills(), name)).find(Boolean);
  // Skills an earlier moment already named stay out, so a later moment adds only what's new.
  const picked = [...new Set(m.skills.map(pick))].filter((s) => s && !used(s) && !shown.has(s.id)).slice(0, 4);
  if (picked.length === 0) continue;
  for (const k of [key, ...(m.covers ?? [])]) shown.add(`milestone:${k}`);
  for (const s of picked) shown.add(s.id);
  writeJson(sessionFile, [...shown]);
  say(
    [
      `Skill suggester: ${m.message}. These installed skills cover it:`,
      ...picked.map((s) => `- ${CMD}${s.id}: ${s.description.slice(0, 160)}`),
      `Before doing what was asked, add one short line to your reply, such as "💡 Before you ${m.before ?? "continue"}: ${CMD}<skill> for <what>, ${CMD}<skill> for <what>." Never run them unasked. They are installed: the user starts them by typing the command, and skills only the user can start are hidden from your skill list, so a skill missing from that list is no reason to skip it.`,
    ].join("\n"),
  );
}

if (/^[/$]/.test(prompt) || prompt.split(/\s+/).length < 4) process.exit(0);

const heavy = settings.heavy ?? DEFAULT_HEAVY;
const isHeavy = (s) => s.userOnly || heavy.some((h) => s.name === h || s.name.startsWith(`${h}-`));

const triggers = readJson(path.join(import.meta.dirname, "..", "triggers.json"), {});
for (const [name, words] of Object.entries(settings.triggers ?? {})) triggers[name] = [...(triggers[name] ?? []), ...words];

// Skills from preferred marketplaces and the user's own folders count extra, so big plugin packs don't
// crowd them out on common words. Others still come up when they clearly fit better.
const prefer = new Set(settings.prefer ?? ["iatee-skills"]);
const weight = (s) => (s.marketplace === null || prefer.has(s.marketplace) ? PREFER_BOOST : 1);

const candidates = score(prompt, skills(), triggers, weight)
  .filter((r) => r.score >= THRESHOLD && !shown.has(r.skill.id) && !used(r.skill))
  .slice(0, MAX_CANDIDATES);
if (candidates.length === 0) process.exit(0);

for (const { skill } of candidates) shown.add(skill.id);
writeJson(sessionFile, [...shown]);

const lines = candidates.map(({ skill }) => {
  const how = isHeavy(skill) ? "suggest to the user" : "you may use it yourself";
  return `- ${CMD}${skill.id} (${how}): ${skill.description.slice(0, 240)}`;
});
say(
  [
    "Skill suggester: these installed skills might fit this request.",
    ...lines,
    "Only act if one is a clear, strong fit; otherwise ignore this note entirely and do not mention it.",
    `For "suggest to the user": add one short line to your reply, such as "💡 ${CMD}<name> could help here: <why>". Never run it unasked.`,
    `For "you may use it yourself": use the skill if it helps, and say so in one short line, such as "💡 Using ${CMD}<name> for <why>."`,
    "Mention at most one skill.",
  ].join("\n"),
);
