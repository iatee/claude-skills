// Shared by llms.txt and llms-full.txt.
import { getCollection } from "astro:content";
import marketplace from "../../.claude-plugin/marketplace.json";

const ORDER = ["start-here", "using-skills", "catalog", "power-user", "customize", "own-server", "privacy"];

export const guides = async () =>
  (await getCollection("docs")).sort((a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99));

export const intro = `# Claude Skills

> A curated set of Claude Code skills, each credited to its author, with a suggester that points out the right one while you work. An unofficial, personal collection, not affiliated with or endorsed by Anthropic.

Install everything in Claude Code:

\`\`\`
/plugin marketplace add iatee/claude-skills
/plugin install all@${marketplace.name}
/reload-plugins
\`\`\`
`;
