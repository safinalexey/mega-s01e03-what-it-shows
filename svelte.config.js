import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { resolve } from 'node:path';

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [vitePreprocess(), mdsvex({
    extensions: ['.svx'],
    layout: { runbook: resolve('src/lib/layouts/runbook.svelte') }
  })],
  kit: {
    adapter: adapter(),
    alias: { '#lib': resolve('src/lib') }
  }
};
