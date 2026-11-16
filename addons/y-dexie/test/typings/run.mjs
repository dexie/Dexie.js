import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const tsc = require.resolve('typescript/bin/tsc');
const config = fileURLToPath(new URL('./tsconfig.json', import.meta.url));
let failed = false;

for (const [module, resolution] of [
  ['Node16', 'Node16'],
  ['NodeNext', 'NodeNext'],
  ['ESNext', 'Bundler'],
]) {
  for (const skipLibCheck of [false, true]) {
    console.log(
      `Checking y-dexie exports: ${resolution}, skipLibCheck=${skipLibCheck}`
    );
    const result = spawnSync(
      process.execPath,
      [
        tsc,
        '--project',
        config,
        '--module',
        module,
        '--moduleResolution',
        resolution,
        '--skipLibCheck',
        String(skipLibCheck),
      ],
      { stdio: 'inherit' }
    );
    if (result.error) throw result.error;
    if (result.status !== 0) failed = true;
  }
}

if (failed) process.exitCode = 1;
