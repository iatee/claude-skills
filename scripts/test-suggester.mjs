#!/usr/bin/env node
// Runs the suggester's prompt hook against a throwaway Claude config folder with a few fake
// plugins and transcripts, and checks what it tells Claude. Needs nothing installed.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOOK = path.resolve(import.meta.dirname, "..", "plugins", "suggester", "scripts", "suggest.mjs");
const config = fs.mkdtempSync(path.join(os.tmpdir(), "suggester-test-"));
const write = (file, text) => {
  fs.mkdirSync(path.dirname(path.join(config, file)), { recursive: true });
  fs.writeFileSync(path.join(config, file), text);
};
const skill = (dir, description, name = path.basename(dir)) => write(`${dir}/SKILL.md`, `---\nname: ${name}\ndescription: ${description}\n---\n`);

// "web" keeps its skills in a custom folder named in plugin.json, plus one command;
// its seo skill's folder name differs from its frontmatter name, as in canva's plugin.
write("plugins/web/.claude-plugin/plugin.json", JSON.stringify({ name: "web", skills: ["./skills/nested"] }));
skill("plugins/web/skills/nested/impeccable", "Design, critique and polish frontend interfaces.");
skill("plugins/web/skills/nested/seo-audit", "Run an SEO audit on a website.", "web-seo-audit");
write("plugins/web/commands/write-article.md", "---\ndescription: Write an SEO-optimized blog article with headings, meta description and schema markup.\n---\n");
skill("plugins/dev/skills/code-review", "Review a branch against the spec and coding standards.");
skill("plugins/ours/skills/diagnosing-bugs", "Diagnosis loop for hard bugs.");
write("plugins/ours/skills/grill-me/SKILL.md", "---\nname: grill-me\ndescription: Stop. A relentless interview to sharpen a plan.\ndisable-model-invocation: true\n---\n");
skill("plugins/dev/skills/handoff", "Write a handoff document so a fresh session can continue.");
// "ours" comes from the preferred marketplace; "pack" from another, with a closer wording for newsletters.
skill("plugins/ours/skills/mail-draft", "Draft a newsletter issue for subscribers.");
skill("plugins/pack/skills/mailer-pro", "Write a newsletter issue for your subscribers.");
skill("plugins/sec/skills/vibe-security", "Audits apps for security holes AI assistants leave: exposed keys, open database rules, payments.");
skill("plugins/sec/skills/vibesec", "Secure coding rules for web apps: access control, XSS, CSRF, SSRF, file uploads.");
skill("plugins/pack/skills/podcast-planner", "Plan a podcast episode outline and guest questions.");
// A skill synced from claude.ai, which Claude Code lists with a plugin prefix.
skill("skills/synced/bucket/deep-research", "Research a question in depth across many web sources and write a cited report.");
skill("skills/brand-check", "Check copy against my brand voice.");
skill("skills/change-request", "Create a change management request with impact analysis and a rollback plan.");
skill("skills/review-reputation", "Watches what customers say about your work in public and does something about it, too.");
// Codex reads skills from ~/.agents/skills (HOME is the config folder here).
skill(".agents/skills/impeccable", "Design, critique and polish frontend interfaces.");
skill(".agents/skills/code-review", "Review a branch against the spec and coding standards.");
write(
  "plugins/installed_plugins.json",
  JSON.stringify({ plugins: { "web@m": [{ installPath: path.join(config, "plugins/web") }], "dev@m": [{ installPath: path.join(config, "plugins/dev") }],
      "ours@iatee-skills": [{ installPath: path.join(config, "plugins/ours") }],
      "pack@big": [{ installPath: path.join(config, "plugins/pack") }],
      "sec@iatee-skills": [{ installPath: path.join(config, "plugins/sec") }],
    },
  }),
);

const line = (entry) => JSON.stringify(entry);
const editOf = (file) => line({ type: "assistant", message: { content: [{ type: "tool_use", name: "Edit", input: { file_path: file } }] } });
const listing = (names, content) => line({ type: "attachment", attachment: { type: "skill_listing", names, content } });
write("web.jsonl", editOf("site/index.astro"));
write("go.jsonl", editOf("api/server.go"));
write("used.jsonl", [editOf("site/index.astro"), line({ type: "assistant", message: { content: [{ type: "tool_use", name: "Skill", input: { skill: "web:impeccable" } }] } })].join("\n"));
write(
  "listed.jsonl",
  [editOf("api/server.go"), listing(["dev:code-review", "simplify", "anthropic-skills:deep-research"], "- simplify: Clean up changed code.\n- anthropic-skills:deep-research: Research.")].join("\n"),
);

let session = 0;
const run = (prompt, transcript = "go.jsonl", { sameSession = false, codex = false } = {}) => {
  if (!sameSession) session++;
  const input = JSON.stringify({ prompt, session_id: `test-${session}`, transcript_path: path.join(config, transcript), cwd: config });
  const out = execFileSync("node", codex ? [HOOK, "--codex"] : [HOOK], { input, env: { ...process.env, CLAUDE_CONFIG_DIR: config, HOME: config }, encoding: "utf8" });
  return out ? JSON.parse(out).hookSpecificOutput.additionalContext : "";
};
const suggested = (context) => [...context.matchAll(/^- [/$](\S+?):? /gm)].map((m) => m[1]);

const cases = {
  "publishing a site suggests the design and SEO checks"() {
    assert.deepEqual(suggested(run("ok deploy it", "web.jsonl")), ["web:impeccable", "sec:vibe-security", "web:seo-audit"]);
  },
  "a milestone is mentioned once per session"() {
    run("ok deploy it", "web.jsonl");
    assert.equal(run("ok deploy it", "web.jsonl", { sameSession: true }), "");
  },
  "publishing without web files says nothing"() {
    assert.equal(run("ok deploy it", "go.jsonl"), "");
  },
  "milestone phrases match in other languages"() {
    assert.match(run("Parfait, on fait la mise en ligne", "web.jsonl"), /publish a website/);
    assert.match(run("Die Website ist fertig, bitte live schalten", "web.jsonl"), /publish a website/);
  },
  "a skill already used this session is left out"() {
    assert.deepEqual(suggested(run("ok deploy it", "used.jsonl")), ["sec:vibe-security", "web:seo-audit"]);
  },
  "built-ins come from builtins.json until Claude Code lists the session's skills"() {
    // Without coding:code-review, a plain "code-review" means the built-in, ahead of another plugin's skill of that name.
    assert.deepEqual(suggested(run("looks good, open a pr")), ["code-review", "security-review", "sec:vibe-security", "simplify"]);
    assert.deepEqual(suggested(run("looks good, open a pr", "listed.jsonl")), ["dev:code-review", "sec:vibe-security", "simplify"]);
  },
  "plugin commands in custom folders are suggested"() {
    assert.ok(suggested(run("write an seo optimized blog article with a meta description")).includes("web:write-article"));
  },
  "synced skills take their listed id"() {
    assert.ok(suggested(run("research this question in depth across web sources", "listed.jsonl")).includes("anthropic-skills:deep-research"));
  },
  "users can add milestones for their own skills"() {
    write("skill-suggester/settings.json", JSON.stringify({ milestones: { newsletter: { when: ["send the newsletter"], message: "the user is sending a newsletter", skills: ["brand-check"] } } }));
    assert.deepEqual(suggested(run("now send the newsletter")), ["brand-check"]);
    fs.rmSync(path.join(config, "skill-suggester/settings.json"));
  },
  "suggester off silences everything"() {
    run("/suggester off");
    assert.equal(run("ok deploy it", "web.jsonl"), "");
    run("/suggester on");
  },
  "trigger phrases match other word endings"() {
    assert.ok(suggested(run("the app crashes on startup every time")).includes("ours:diagnosing-bugs"));
  },
  "session start lists the skills only the user can start"() {
    const input = JSON.stringify({ cwd: config });
    const out = execFileSync("node", [path.join(path.dirname(HOOK), "session-start.mjs")], { input, env: { ...process.env, CLAUDE_CONFIG_DIR: config, HOME: config }, encoding: "utf8" });
    assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /^- \/ours:grill-me: Stop\. A relentless interview to sharpen a plan\.$/m);
  },
  "unrelated prompts say nothing"() {
    assert.equal(run("what is the capital of peru"), "");
  },
  "milestone phrases accept any article"() {
    assert.deepEqual(suggested(run("could you create the pull request and push our changes")), ["code-review", "security-review", "sec:vibe-security", "simplify"]);
  },
  "\"pull request\" doesn't match skills about requests"() {
    assert.ok(!suggested(run("please create a summary of the pull request changes")).includes("change-request"));
  },
  "skills from our marketplace win a close match"() {
    assert.equal(suggested(run("help me write a newsletter issue for my subscribers"))[0], "ours:mail-draft");
  },
  "other plugins still come up when only they fit"() {
    assert.ok(suggested(run("plan a podcast episode outline with guest questions")).includes("pack:podcast-planner"));
  },
  "security prompts bring up the security skills"() {
    assert.ok(suggested(run("is my app safe to launch?")).includes("sec:vibe-security"));
    assert.ok(suggested(run("add a file upload for profile pictures")).includes("sec:vibesec"));
    assert.equal(run("the session timer in the game is off by one second"), "");
  },
  "filler words alone don't make a match"() {
    assert.equal(run("can we get the sugester to work in codek too? and btw my suggester never suggested something"), "");
  },
  "codex suggests only its own skills, as $name"() {
    const context = run("ok deploy it", "web.jsonl", { codex: true });
    assert.deepEqual(suggested(context), ["impeccable"]);
    assert.match(context, /\$<skill>/);
    assert.deepEqual(suggested(run("looks good, open a pr", "go.jsonl", { codex: true })), ["code-review"]);
  },
};

let failed = 0;
for (const [name, test] of Object.entries(cases)) {
  try {
    test();
    console.log(`✔ ${name}`);
  } catch (error) {
    failed++;
    console.log(`✘ ${name}\n  ${error.message.split("\n").join("\n  ")}`);
  }
}
fs.rmSync(config, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
