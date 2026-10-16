import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// Each post is personal or practice, and its tag says which: it decides the post's filtered
			// view and shows next to its date. A post without either tag is personal.
			tags: z
				.array(z.string())
				.default([])
				.transform((tags) => (tags.includes('practice') || tags.includes('personal') ? tags : [...tags, 'personal']))
				.refine((tags) => !(tags.includes('practice') && tags.includes('personal')), {
					message: 'Un post es personal o practice, no los dos.',
				}),
			// The language the post was written in. English when omitted
			lang: z.enum(['en', 'es']).default('en'),
			heroImage: z.optional(image()),
		}),
});

export const collections = { blog };
