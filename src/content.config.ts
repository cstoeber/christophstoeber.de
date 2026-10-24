import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(), description: z.string(),
    hero: z.string().optional(), heroAlt: z.string().optional(),
    videos: z.array(z.object({ title: z.string(), url: z.url(), poster: z.string().nullish() })).default([]),
    inquiry: z.object({title:z.string(),text:z.string(),buttonLabel:z.string(),subject:z.string()}).optional(),
  }),
});
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({ title: z.string() }),
});
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), order: z.number().default(0), published: z.boolean().default(true),
    showMediaLink: z.boolean().default(true),
    image: z.string().default(''), imageAlt: z.string().default(''), caption: z.string().default(''), copyright: z.string().default(''),
    videos: z.array(z.object({title:z.string(),url:z.url(),poster:z.string().nullish()})).default([]),
    links: z.array(z.object({ prefix: z.string().default(''), label: z.string(), url: z.url(), icon:z.enum(['auto','website','email','instagram','youtube','soundcloud','linktree','spotify','none']).default('auto') })).default([]),
  }),
});
const mediaSections = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/media' }),
  schema: z.object({
    title: z.string(), order: z.number().default(0), published: z.boolean().default(true),
    project: z.string().nullish().transform(value=>value||''),
    images: z.array(z.object({image:z.string(),alt:z.string(),caption:z.string().default(''),copyright:z.string().default('')})).nullish().transform(value=>value||[]),
    videos: z.array(z.object({title:z.string(),url:z.url(),poster:z.string().nullish()})).default([]),
  }),
});
export const collections = { pages, legal, projects, mediaSections };
