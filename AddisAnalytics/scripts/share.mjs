#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import localtunnel from 'localtunnel';

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

let tunnel;
let shuttingDown = false;

const closeTunnel = async () => {
  if (!tunnel) return;

  await new Promise((resolve) => {
    const onClose = () => {
      tunnel?.off('close', onClose);
      resolve();
    };

    tunnel.once('close', onClose);
    tunnel.close();
  }).catch(() => undefined);
};

const stopNext = () => {
  if (!nextProcess.killed) {
    nextProcess.kill('SIGINT');
  }
};

const shutdown = async (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  await closeTunnel();
  stopNext();

  process.exit(exitCode);
};

const logShareUrl = (url) => {
  console.log('\n────────────────────────────────────────');
  console.log('Shareable link ready:');
  console.log(`  ${url}`);
  console.log('\nKeep this terminal open to keep the tunnel active. Press Ctrl+C to stop.');
  console.log('────────────────────────────────────────\n');
};

const startTunnel = async () => {
  try {
    const options = { port };
    if (process.env.SHARE_SUBDOMAIN) {
      options.subdomain = process.env.SHARE_SUBDOMAIN;
    }
    if (process.env.SHARE_TUNNEL_HOST) {
      options.host = process.env.SHARE_TUNNEL_HOST;
    }

    console.log('\nOpening a secure localtunnel session...');
    tunnel = await localtunnel(options);
    logShareUrl(tunnel.url);

    tunnel.on('close', () => {
      if (!shuttingDown) {
        console.log('\nTunnel closed unexpectedly. Shutting down the server.');
        shutdown(1);
      }
    });
  } catch (error) {
    console.error('\nFailed to open a localtunnel session. Make sure you have internet access and try again.');
    if (error) {
      console.error(error.message ?? error);
    }
    shutdown(1);
  }
};

startTunnel();

process.on('SIGINT', () => {
  shutdown(0);
});

process.on('SIGTERM', () => {
  shutdown(0);
});

nextProcess.on('exit', (code) => {
  console.log(`\nNext.js process exited with code ${code ?? 0}.`);
  shutdown(code ?? 0);
});

nextProcess.on('error', (error) => {
  console.error('\nFailed to launch the Next.js server.');
  if (error) {
    console.error(error.message ?? error);
  }
  shutdown(1);
});
