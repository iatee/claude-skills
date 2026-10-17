// llms.txt (https://llmstxt.org): a plain-text map of the site for AI assistants, built from the guides.
import type { APIRoute } from "astro";
import { guides, intro } from "../llms";

export const GET: APIRoute = async ({ site }) => {
  const list = (await guides()).map((g) => `- [${g.data.title}](${new URL(`/${g.id}/`, site)}): ${g.data.description}`);
  const text = [
    intro,
    "## Guides",
    "",
    ...list,
    "",
    "## Optional",
    "",
    `- [Full text of every guide](${new URL("/llms-full.txt", site)})`,
    `- [Source repository](https://github.com/iatee/claude-skills)`,
    "",
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
