import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  site: 'https://www.christophstoeber.de',
  trailingSlash: 'always',
  redirects: { '/produktion/': {status:301,destination:'/projekte/#produktion'} },
  vite: {
    // YAML's ESM distribution also works in Astro's Windows module runner.
    resolve: { alias: { yaml: fileURLToPath(new URL('./node_modules/yaml/browser/index.js', import.meta.url)) } },
    server: { watch: { ignored: ['**/.reference/**'] } },
  },
});
