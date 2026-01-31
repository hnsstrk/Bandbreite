import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true,
			strict: true
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore missing parent routes (index pages for sections)
				if (path === '/datenbanken' || path === '/rechner' || path === '/konverter/frequenz') {
					console.warn(`Warning: ${path} not found (linked from ${referrer})`);
					return;
				}
				// Throw for other errors
				throw new Error(message);
			}
		}
	}
};

export default config;
