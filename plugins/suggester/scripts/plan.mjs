// Remembers the last numbered plan of slash commands Claude wrote, such as impeccable's
// "Recommended actions", and which of its steps have run. Running one step tells Claude which
// step comes next; "run the plan" has Claude run every remaining step. Plans are kept per
// project, so they survive into a new session.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { STATE_DIR } from "./index.mjs";

// A numbered line with a command in backticks: "1. **[P2] `/impeccable harden`:** copy feedback".
const STEP_LINE = /^\s*\d+[.)]\s+.*?`(\/[^`]+)`(.*)$/;
// Slash commands anywhere in a prompt: "/frontend:impeccable harden" or "commit this, /impeccable polish".
const PROMPT_COMMAND = /(?:^|\s)(\/[a-z0-9][\w:-]*(?:[ \t]+[a-z][\w-]*)?)/gi;
// "/suggester plan", "run the plan", "continue the plan", "finish the rest of the plan".
const RUN_PLAN = /^\/(?:suggester:)?suggester\s+plan\b|\b(?:run|continue|finish|do|resume)\s+(?:the\s+)?(?:rest\s+of\s+the\s+)?plan\b/i;

// "/frontend:impeccable harden" and "/impeccable harden" are the same step: the plugin prefix and
// anything after the first argument don't count.
const stepKey = (command) => {
  const [name, arg = ""] = command.replace(/^\//, "").trim().split(/\s+/);
  return `${name.split(":").pop()} ${arg}`.trim().toLowerCase();
};

const note = (rest) =>
  rest
    .replace(/\*\*|`/g, "")
    .replace(/^[\s:–—-]+/, "")
    .replace(/[.\s]+$/, "")
    .trim();

// Each run of two or more consecutive numbered command lines in a text is one plan.
const plansIn = (text) => {
  const plans = [];
  let current = [];
  const close = () => {
    if (current.length >= 2) plans.push(current);
    current = [];
  };
  for (const line of text.split("\n")) {
    const match = line.match(STEP_LINE);
    if (match) current.push({ command: match[1].trim(), key: stepKey(match[1]), note: note(match[2]) });
    else if (line.trim()) close();
  }
  close();
  return plans;
};

const parse = (line) => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};

// A command the user typed: their message starts with Claude Code's command tags.
const TYPED_COMMAND = /^\s*(?:<command-message>[^<]*<\/command-message>\s*)?<command-name>(\/[^<]+)<\/command-name>(?:\s*<command-args>([^<]*)<\/command-args>)?/;

// Commands that ran in a transcript line: ones the user typed, and skills Claude started itself.
// Text that merely mentions a command, such as a tool's input or output, doesn't count.
const commandsRun = (line) => {
  if (!line.includes("<command-name>") && !line.includes('"name":"Skill"')) return [];
  const entry = parse(line);
  const keys = [];
  if (entry?.type === "user") {
    const content = entry.message?.content;
    const text = typeof content === "string" ? content : content?.find?.((b) => b.type === "text")?.text ?? "";
    const typed = text.match(TYPED_COMMAND);
    if (typed) keys.push(stepKey(`${typed[1]} ${typed[2] ?? ""}`));
  }
  if (entry?.type === "assistant") {
    for (const block of entry.message?.content ?? []) {
      if (block.type === "tool_use" && block.name === "Skill") keys.push(stepKey(`/${block.input?.skill} ${block.input?.args ?? ""}`));
    }
  }
  return keys;
};

// Plans in Claude's replies, newest first, and the steps that ran after the newest one.
// Only assistant text counts as a plan, never the user's own messages.
const readTranscript = (transcript) => {
  const plans = [];
  const ran = new Set();
  const lines = transcript.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (plans.length === 0) for (const key of commandsRun(line)) ran.add(key);
    if (!line.includes('"type":"assistant"') || !line.includes("`/")) continue;
    for (const block of parse(line)?.message?.content ?? []) {
      if (block.type === "text") plans.push(...plansIn(block.text).reverse());
    }
  }
  return { plans, ran };
};

const planFile = (cwd) =>
  path.join(STATE_DIR, "plans", `${crypto.createHash("sha256").update(cwd).digest("hex").slice(0, 16)}.json`);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// The newest plan for this project with its done steps, saved so that a later session still has it.
// Also returns older plans from this session, for prompts that run a step of one of those.
const loadPlans = (transcript, cwd) => {
  const file = planFile(cwd);
  let saved = { steps: [], done: [] };
  try {
    saved = { done: [], ...JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {}
  const { plans, ran } = readTranscript(transcript);
  let current = saved;
  if (plans.length) {
    const steps = plans[0];
    const done = [...new Set([...(same(steps, saved.steps) ? saved.done : []), ...steps.filter((s) => ran.has(s.key)).map((s) => s.key)])];
    current = { steps, done };
  }
  if (!same(current, saved)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(current, null, 2));
  }
  return { current, older: plans.slice(1) };
};

// If the prompt runs a step of a known plan, returns that step's position and the step after it.
export const planStep = (prompt, transcript, cwd) => {
  const { current, older } = loadPlans(transcript, cwd);
  const keys = [...prompt.matchAll(PROMPT_COMMAND)].map((m) => stepKey(m[1]));
  if (keys.length === 0) return null;
  for (const plan of [current.steps, ...older]) {
    const index = plan.findIndex((step) => keys.includes(step.key));
    if (index >= 0) return { number: index + 1, total: plan.length, step: plan[index], next: plan[index + 1] };
  }
  return null;
};

// If the prompt asks to run the plan, returns the plan's steps that haven't run yet (maybe none),
// or an empty plan when this project has none.
export const planRun = (prompt, transcript, cwd) => {
  if (!RUN_PLAN.test(prompt)) return null;
  const { current } = loadPlans(transcript, cwd);
  return { total: current.steps.length, remaining: current.steps.filter((s) => !current.done.includes(s.key)) };
};
