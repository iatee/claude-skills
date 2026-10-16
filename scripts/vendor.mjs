#!/usr/bin/env node
// Vendors third-party skills listed in manifest.json into plugins/<plugin>/skills/<name>.
//
//   node scripts/vendor.mjs              Import every skill at the commit pinned in the manifest.
//   node scripts/vendor.mjs sync         Show what changed upstream since the pinned commits.
//   node scripts/vendor.mjs sync <src>   Bump <src> to upstream HEAD and re-import its skills.
//
// Needs Node 18+ and `tar` (bundled with macOS, Linux and Windows 10+).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache", "upstream");
const MANIFEST = path.join(ROOT, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const skillDir = (name, skill) => path.join(ROOT, "plugins", skill.plugin, "skills", name);

async function download(repo, sha) {
  const dir = path.join(CACHE, `${repo.replace("/", "_")}@${sha}`);
  if (fs.existsSync(dir)) return dir;
  const res = await fetch(`https://codeload.github.com/${repo}/tar.gz/${sha}`);
  if (!res.ok) throw new Error(`Downloading ${repo}@${sha} failed: ${res.status}`);
  fs.mkdirSync(dir, { recursive: true });
  const tarball = `${dir}.tar.gz`;
  fs.writeFileSync(tarball, Buffer.from(await res.arrayBuffer()));
  execFileSync("tar", ["xzf", tarball, "-C", dir, "--strip-components", "1"]);
  fs.rmSync(tarball);
  return dir;
}

async function headCommit(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}/commits/HEAD`, {
    headers: { Accept: "application/vnd.github.sha" },
  });
  if (!res.ok) throw new Error(`Looking up HEAD of ${repo} failed: ${res.status}`);
  return (await res.text()).trim();
}

function copySkill(srcRoot, skill, dest) {
  const from = path.join(srcRoot, skill.path);
  if (!fs.existsSync(from)) throw new Error(`${from} does not exist upstream`);
  fs.rmSync(dest, { recursive: true, force: true });
  const entries = skill.include ?? fs.readdirSync(from);
  for (const entry of entries) {
    fs.cpSync(path.join(from, entry), path.join(dest, entry), {
      recursive: true,
      filter: (p) => path.basename(p) !== ".DS_Store",
    });
  }
}

async function importSkills(only) {
  for (const [name, skill] of Object.entries(manifest.skills)) {
    if (only && skill.source !== only) continue;
    const source = manifest.sources[skill.source];
    const dest = skillDir(name, skill);
    const upstream = await download(source.repo, source.commit);

    if (skill.removedUpstream) {
      if (!fs.existsSync(dest)) throw new Error(`${name} is removed upstream and has no local copy`);
    } else {
      copySkill(upstream, skill, dest);
    }
    for (const { file, find, replace } of skill.patches ?? []) {
      const target = path.join(dest, file);
      const text = fs.readFileSync(target, "utf8");
      if (!text.includes(find)) throw new Error(`Patch for ${name}/${file} no longer applies: upstream changed "${find}"`);
      fs.writeFileSync(target, text.replace(find, replace));
    }
    for (const file of [source.licenseFile, source.noticeFile].filter(Boolean)) {
      fs.copyFileSync(path.join(upstream, file), path.join(dest, file));
    }
    console.log(`imported ${name} -> ${path.relative(ROOT, dest)}`);
  }
  writeNotices();
}

function writeNotices() {
  const lines = [
    "# Third-party notices",
    "",
    "This repository redistributes skills written by other people, under the terms of their licenses.",
    "Each vendored skill folder also contains its upstream license file.",
    "This file is generated from `manifest.json` by `scripts/vendor.mjs`; do not edit it by hand.",
    "",
  ];
  for (const [id, source] of Object.entries(manifest.sources)) {
    const skills = Object.entries(manifest.skills).filter(([, s]) => s.source === id);
    lines.push(
      `## ${source.author}`,
      "",
      `- **Upstream:** https://github.com/${source.repo}`,
      `- **Commit:** [\`${source.commit.slice(0, 7)}\`](https://github.com/${source.repo}/tree/${source.commit})`,
      `- **License:** ${source.license}`,
      `- **Skills:** ${skills.map(([n, s]) => `\`${n}\`${s.removedUpstream ? " (no longer upstream; copy from an earlier release)" : ""}`).join(", ")}`,
    );
    for (const [n, s] of skills) if (s.changes) lines.push(`- **Changes to \`${n}\`:** ${s.changes}`);
    if (source.noticeFile) lines.push(`- Includes upstream \`${source.noticeFile}\`, which credits further authors.`);
    lines.push("");
  }
  fs.writeFileSync(path.join(ROOT, "THIRD_PARTY_NOTICES.md"), lines.join("\n"));
}

async function sync(bump) {
  for (const [id, source] of Object.entries(manifest.sources)) {
    if (bump && id !== bump) continue;
    const head = await headCommit(source.repo);
    if (head === source.commit) {
      console.log(`${id}: up to date`);
      continue;
    }
    if (bump) {
      source.commit = head;
      fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
      await importSkills(id);
      console.log(`${id}: bumped to ${head.slice(0, 7)}. Review with \`git diff\`, then bump plugin versions and the changelog.`);
      continue;
    }
    const [oldRoot, newRoot] = [await download(source.repo, source.commit), await download(source.repo, head)];
    console.log(`\n${id}: ${source.commit.slice(0, 7)} -> ${head.slice(0, 7)}`);
    for (const [name, skill] of Object.entries(manifest.skills)) {
      if (skill.source !== id || skill.removedUpstream) continue;
      const [a, b] = [path.join(oldRoot, skill.path), path.join(newRoot, skill.path)];
      if (!fs.existsSync(b)) {
        console.log(`  ${name}: REMOVED upstream`);
        continue;
      }
      try {
        execFileSync("git", ["diff", "--no-index", "--quiet", a, b]);
      } catch {
        const stat = execFileSync("git", ["diff", "--no-index", "--shortstat", a, b], { encoding: "utf8" }).trim();
        console.log(`  ${name}: ${stat}`);
      }
    }
    console.log(`  Accept with: node scripts/vendor.mjs sync ${id}`);
  }
}

const [command, arg] = process.argv.slice(2);
if (command === "sync") await sync(arg);
else await importSkills();
