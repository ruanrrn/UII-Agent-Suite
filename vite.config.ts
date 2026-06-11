import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { execSync } from 'node:child_process';

function machineViews() {
  return {
    name: 'machine-views',
    buildStart() {
      execSync('pnpm gen:machine', { stdio: 'inherit' });
    }
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  // PORT 由预览工具注入（autoPort）；本地手动 dev 缺省 5173
  server: { port: Number(process.env.PORT) || 5173 },
  plugins: [vue(), machineViews()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
});
