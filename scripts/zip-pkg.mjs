// scripts/zip-pkg.mjs —— 把 dist-pkg 打成可直接部署的 zip
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
if (!existsSync('dist-pkg')) {
  console.error('run build:pkg first');
  process.exit(1);
}
const out = 'uii-agent-hub-mock.zip';
try {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path dist-pkg/* -DestinationPath ${out} -Force"`,
    { stdio: 'inherit' }
  );
} catch {
  execSync(`cd dist-pkg && zip -r ../${out} .`, { stdio: 'inherit' });
}
console.log('wrote', out);
