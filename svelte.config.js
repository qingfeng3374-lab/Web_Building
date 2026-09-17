import { vitePreprocess } from '@astrojs/svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Svelte 5 runes 模式：$state / $derived / $effect / $props
    runes: true,
  },
};
