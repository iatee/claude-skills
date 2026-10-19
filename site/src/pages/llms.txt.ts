// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants, built from the guides.
import type { APIRoute } from "astro";
import path from "node:path";
import { guides, intro } from "../llms";
import { loadCatalog } from "../../../scripts/catalog-data.mjs";

export const GET: APIRoute = async ({ site }) => {
  const list = (await guides()).map((g) => `- [${g.data.title}](${new URL(`/${g.id}/`, site)}): ${g.data.description}`);
  const skills = loadCatalog(path.resolve(process.cwd(), "..")).rows.map(
    (r) => `- [${r.name}](${new URL(`/skills/${r.name}/`, site)}): ${r.what}`,
  );
  const text = [
    intro,
    "## Guides",
    "",
    ...list,
    "",
    "## Skills",
    "",
    ...skills,
    "",
    "## Optional",
    "",
    `- [Full text of every guide](${new URL("/llms-full.txt", site)})`,
    `- [Source repository](https://github.com/iatee/claude-skills)`,
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
