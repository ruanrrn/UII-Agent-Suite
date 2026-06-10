// scripts/deploy-pages.mjs —— 本地把 Pages 版部署到"公开产物仓库"（阶段 1）
// 用法：DEPLOY_REPO=git@github.com:<org>/uii-agent-hub-site.git PAGES_BASE=/uii-agent-hub-site/ node scripts/deploy-pages.mjs
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const repo = process.env.DEPLOY_REPO;
const base = process.env.PAGES_BASE;
if (!repo || !base) {
  console.error('Set DEPLOY_REPO and PAGES_BASE env vars (产物仓库地址与子路径)');
  process.exit(1);
}
const run = (c, o = {}) => execSync(c, { stdio: 'inherit', ...o });

run('pnpm lint');
run('pnpm test');
process.env.VITE_BASE = base;
run('pnpm build:pages');
writeFileSync('dist/.nojekyll', '');
run('git init -q', { cwd: 'dist' });
run('git checkout -q -B gh-pages', { cwd: 'dist' });
run('git add -A', { cwd: 'dist' });
run(
  'git -c user.email=deploy@uii-ai.example -c user.name=deploy commit -q -m "deploy: pages build"',
  {
    cwd: 'dist'
  }
);
run(`git push -f ${repo} gh-pages`, { cwd: 'dist' });
console.log('Deployed dist →', repo, 'gh-pages. 到产物仓库 Settings→Pages 选择 gh-pages 分支。');
if (!existsSync('dist/index.html')) process.exit(1);
