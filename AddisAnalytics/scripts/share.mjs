#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const port = Number(process.env.PORT ?? 3000);
const cwd = process.cwd();
const buildDir = path.join(cwd, '.next');

if (!fs.existsSync(buildDir)) {
  console.error('\nNo production build found. Run "npm run build" before sharing the app.');
  process.exit(1);
}

const nextEnv = { ...process.env, PORT: String(port) };
const nextProcess = spawn('npm', ['run', 'start'], {
  cwd,
  env: nextEnv,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const sshArgs = [
  '-T',
  '-N',
  '-o',
  'StrictHostKeyChecking=no',
  '-o',
  'ServerAliveInterval=60',
  '-o',
  'ServerAliveCountMax=3',
  '-R',
  `80:localhost:${port}`,
  'nokey@localhost.run',
];

const tunnelProcess = spawn('ssh', sshArgs, {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let announced = false;

const highlightOutput = (data) => {
  const text = data.toString();
  process.stdout.write(`[tunnel] ${text}`);
  if (!announced) {
    const match = text.match(/https?:\/\/[^\s]+/);
    if (match) {
      announced = true;
      console.log('\n────────────────────────────────────────');
      console.log('Shareable link ready:');
      console.log(`  ${match[0]}`);
      console.log('\nKeep this terminal open to keep the tunnel active. Press Ctrl+C to stop.');
      console.log('────────────────────────────────────────\n');
    }
  }
};

tunnelProcess.stdout.on('data', highlightOutput);
tunnelProcess.stderr.on('data', highlightOutput);

const shutdown = () => {
  if (!tunnelProcess.killed) {
    tunnelProcess.kill('SIGINT');
  }
  if (!nextProcess.killed) {
    nextProcess.kill('SIGINT');
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

nextProcess.on('exit', (code) => {
  console.log(`\nNext.js process exited with code ${code ?? 0}.`);
  if (!tunnelProcess.killed) {
    tunnelProcess.kill('SIGINT');
  }
  process.exit(code ?? 0);
});

tunnelProcess.on('exit', (code) => {
  console.log(`\nSSH tunnel exited with code ${code ?? 0}.`);
  if (!nextProcess.killed) {
    nextProcess.kill('SIGINT');
  }
  process.exit(code ?? 0);
});
