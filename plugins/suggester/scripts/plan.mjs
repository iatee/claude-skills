// Remembers the last numbered plan of slash commands Claude wrote, such as impeccable's
// "Recommended actions", so that running one step tells Claude which step comes next.
// Plans are kept per project, so they survive into a new session.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { STATE_DIR } from "./index.mjs";

// A numbered line with a command in backticks: "1. **[P2] `/impeccable harden`:** copy feedback".
const STEP_LINE = /^\s*\d+[.)]\s+.*?`(\/[^`]+)`(.*)$/;
// Slash commands anywhere in a prompt: "/frontend:impeccable harden" or "commit this, /impeccable polish".
const PROMPT_COMMAND = /(?:^|\s)(\/[a-z0-9][\w:-]*(?:[ \t]+[a-z][\w-]*)?)/gi;

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

// Plans in Claude's replies, newest first. Only assistant text counts, never the user's own messages.
const plansInTranscript = (transcript) => {
  const plans = [];
  const lines = transcript.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.includes('"type":"assistant"') || !line.includes("`/")) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    for (const block of entry.message?.content ?? []) {
      if (block.type === "text") plans.push(...plansIn(block.text).reverse());
    }
  }
  return plans;
};

const planFile = (cwd) =>
  path.join(STATE_DIR, "plans", `${crypto.createHash("sha256").update(cwd).digest("hex").slice(0, 16)}.json`);

// If the prompt runs a step of a known plan, returns that step's position and the step after it.
// Also saves the newest plan in this session for the project, so a later session still has it.
export const planStep = (prompt, transcript, cwd) => {
  const file = planFile(cwd);
  const found = plansInTranscript(transcript);
  let saved = [];
  try {
    saved = JSON.parse(fs.readFileSync(file, "utf8")).steps ?? [];
  } catch {}
  if (found.length && JSON.stringify(found[0]) !== JSON.stringify(saved)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ steps: found[0] }, null, 2));
  }

  const keys = [...prompt.matchAll(PROMPT_COMMAND)].map((m) => stepKey(m[1]));
  if (keys.length === 0) return null;
  for (const plan of [...found, saved]) {
    const index = plan.findIndex((step) => keys.includes(step.key));
    if (index >= 0) return { number: index + 1, total: plan.length, step: plan[index], next: plan[index + 1] };
  }
  return null;
};
