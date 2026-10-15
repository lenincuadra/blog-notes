// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://notes.lenincuadra.com',
	integrations: [mdx(), sitemap()],
	markdown: {
		// Code blocks follow the blog's light/dark toggle (see global.css)
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			// Long lines wrap instead of scrolling sideways, so nothing is cut off on a phone
			wrap: true,
		},
	},
});
