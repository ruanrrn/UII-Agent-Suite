import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { execSync } from 'node:child_process';

function appVersion() {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION;
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return String(Date.now());
  }
}

function machineViews() {
  let generated = false;
  function generate() {
    if (generated) return;
    execSync('pnpm gen:machine', { stdio: 'inherit' });
    generated = true;
  }
  return {
    name: 'machine-views',
    // 在 Vite 初始化 public 静态中间件之前生成机器视图 / mock 数据。
    // 若放在 buildStart，dev 下会在中间件装载后重写 public 文件，
    // 导致这些静态文件无法被服务（fallback 成 index.html）。
    config() {
      generate();
    },
    buildStart() {
      generate();
    }
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion())
  },
  // PORT 由预览工具注入（autoPort）；本地手动 dev 缺省 5173
  server: { port: Number(process.env.PORT) || 5173 },
  plugins: [vue(), machineViews()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
});
