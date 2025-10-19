#!/usr/bin/env node
import { existsSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const eslintPath = path.join(process.cwd(), 'node_modules', 'eslint');
const hasEslint = existsSync(eslintPath);

if (hasEslint) {
  const lintResult = spawnSync('npx', ['next', 'lint'], {
    stdio: 'inherit',
    shell: true,
  });
  process.exit(lintResult.status ?? 0);
}

console.warn('ESLint not found; running TypeScript check instead.');
const tsResult = spawnSync('npx', ['tsc', '--noEmit'], {
  stdio: 'inherit',
  shell: true,
});
process.exit(tsResult.status ?? 0);
