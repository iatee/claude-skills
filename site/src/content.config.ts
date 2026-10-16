import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

// The guides are written once, in the repository's docs/guides folder, and read from there.
export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: "*.md", base: "../docs/guides" }),
    schema: docsSchema(),
  }),
};
