// The full Markdown of every guide in one file, for AI assistants that read llms.txt.
import type { APIRoute } from "astro";
import { guides, intro } from "../llms";

export const GET: APIRoute = async ({ site }) => {
  const sections = (await guides()).map(
    (g) => `# ${g.data.title}\n\nSource: ${new URL(`/${g.id}/`, site)}\n\n${g.body?.replace(/<!--[\s\S]*?-->\n*/g, "").trim()}\n`,
  );
  return new Response([intro, ...sections].join("\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
