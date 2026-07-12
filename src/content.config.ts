import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lang: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["ai", "onchain", "community", "side"]),
    order: z.number(),
    featured: z.number().optional(),
    role: z.string().optional(),
    status: z.enum(["active", "maintained", "archived"]).optional(),
    outcomes: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    websiteURL: z.string().url().optional(),
    repoURL: z.string().url().optional(),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    location: z.string().optional(),
    summary: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
    websiteURL: z.string().url().optional(),
  }),
});

export const collections = { blog, projects, work };
