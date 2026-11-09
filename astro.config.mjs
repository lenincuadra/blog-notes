// @ts-check

import { copyFile } from 'node:fs/promises';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// @astrojs/sitemap writes sitemap-index.xml; search engines look for /sitemap.xml first,
// so the build also publishes the same file under that name (robots.txt points to it).
// It runs after sitemap(), because Astro runs the integrations in order.
const sitemapXml = {
	name: 'sitemap-xml',
	hooks: {
		'astro:build:done': async ({ dir }) => {
			await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
		},
	},
};

// https://astro.build/config
export default defineConfig({
	site: 'https://notes.lenincuadra.com',
	integrations: [mdx(), sitemap(), sitemapXml],
	markdown: {
		// Code blocks follow the blog's light/dark toggle (see global.css)
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			// Long lines wrap instead of scrolling sideways, so nothing is cut off on a phone
			wrap: true,
		},
	},
});
