#!/usr/bin/env node
// UserPromptSubmit hook: if an installed skill clearly fits the prompt, tell Claude about it.
// Prints nothing (zero tokens) when nothing scores above the threshold.

import fs from "node:fs";
import path from "node:path";
import { STATE_DIR, loadIndex, score } from "./index.mjs";
import { planRun, planStep } from "./plan.mjs";

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
if (settings.enabled === false) process.exit(0);

let transcript = "";
try {
  transcript = fs.readFileSync(input.transcript_path, "utf8");
} catch {}

const say = (context) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context } }));
  process.exit(0);
};
const cwd = input.cwd ?? process.cwd();

// "Run the plan": Claude runs every step that hasn't run yet, committing after each, without pausing.
const run = planRun(prompt, transcript, cwd);
if (run) {
  if (run.total === 0) say("Skill suggester: the user asked to run the plan, but no plan is remembered for this project. Say so in one line.");
  if (run.remaining.length === 0) say("Skill suggester: every step of the remembered plan has already run. Say so in one line.");
  const skills = loadIndex(cwd);
  const steps = run.remaining.map((step, i) => {
    const [name, ...args] = step.command.replace(/^\//, "").split(/\s+/);
    const skill = skills.find((s) => s.id === name || s.name === name.split(":").pop());
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
const step = planStep(prompt, transcript, cwd);
if (step) {
  const next = step.next
    ? `When this step is done, end your reply with one line: "Next step: \`${step.next.command}\`${step.next.note ? ` (${step.next.note})` : ""}."`
    : "This is the last step of that plan. When it is done, say so in one short line.";
  say(`Skill suggester: this prompt runs step ${step.number} of ${step.total} of a plan from earlier (\`${step.step.command}\`). ${next}`);
}

if (prompt.startsWith("/") || prompt.split(/\s+/).length < 4) process.exit(0);

// Skills already suggested this session, or already used, stay quiet.
const sessionFile = path.join(STATE_DIR, "sessions", `${input.session_id ?? "unknown"}.json`);
const shown = new Set(readJson(sessionFile, []));
const used = (id) => transcript.includes(`"skill":"${id}"`) || transcript.includes(`<command-name>/${id}<`);

const heavy = settings.heavy ?? DEFAULT_HEAVY;
const isHeavy = (s) => s.userOnly || heavy.some((h) => s.name === h || s.name.startsWith(`${h}-`));

const triggers = readJson(path.join(import.meta.dirname, "..", "triggers.json"), {});
for (const [name, words] of Object.entries(settings.triggers ?? {})) triggers[name] = [...(triggers[name] ?? []), ...words];

const candidates = score(prompt, loadIndex(cwd), triggers)
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
