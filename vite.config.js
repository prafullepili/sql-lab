import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'sql-lab';

export default defineConfig({
  // GitHub Pages serves project sites under /<repository>/; local dev stays at /.
  base: isGitHubActions ? `/${repositoryName}/` : '/',
  plugins: [tailwindcss()],
});
