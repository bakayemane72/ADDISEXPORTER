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
let nextProcess;
const nextProcess = spawn('npm', ['run', 'start'], {
  cwd,
  env: nextEnv,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

let tunnelProcess;
let tunnelUrl;
let shuttingDown = false;

const closeTunnel = async () => {
  if (!tunnelProcess || tunnelProcess.exitCode !== null) return;

  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (tunnelProcess && tunnelProcess.exitCode === null) {
        try {
          process.kill(tunnelProcess.pid, 'SIGTERM');
        } catch {
          // ignore
        }
      }
    }, 5000);

    tunnelProcess.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });

    try {
      process.kill(tunnelProcess.pid, 'SIGINT');
    } catch {
      clearTimeout(timer);
      resolve();
    }
  }).catch(() => undefined);
};

const stopNext = () => {
  if (!nextProcess || nextProcess.exitCode !== null) return;
  if (nextProcess.exitCode !== null) return;

  try {
    process.kill(nextProcess.pid, 'SIGINT');
  } catch {
    return;
  }

  setTimeout(() => {
    if (nextProcess && nextProcess.exitCode === null) {
    if (nextProcess.exitCode === null) {
      try {
        process.kill(nextProcess.pid, 'SIGTERM');
      } catch {
        // ignore
      }
    }
  }, 5000);
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
  console.log('\nOpening a secure localtunnel session with npx...');

  const tunnelArgs = ['localtunnel', '--port', String(port)];
  if (process.env.SHARE_SUBDOMAIN) {
    tunnelArgs.push('--subdomain', process.env.SHARE_SUBDOMAIN);
  }
  if (process.env.SHARE_TUNNEL_HOST) {
    tunnelArgs.push('--host', process.env.SHARE_TUNNEL_HOST);
  }

  tunnelProcess = spawn('npx', tunnelArgs, {
    cwd,
    env: nextEnv,
    shell: process.platform === 'win32',
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  tunnelProcess.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    if (!tunnelUrl) {
      const match = text.match(/https?:\/\/[^\s]+/);
      if (match) {
        tunnelUrl = match[0];
        logShareUrl(tunnelUrl);
      }
    }
  });

  tunnelProcess.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  tunnelProcess.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`\nlocaltunnel process exited with code ${code ?? 0}. Stopping the server.`);
      shutdown(code ?? 1);
    }
  });

  tunnelProcess.on('error', (error) => {
    console.error('\nFailed to launch the localtunnel CLI.');
    if (error) {
      console.error(error.message ?? error);
    }
    shutdown(1);
  });
};

const runCommand = (command, args, options) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 0}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });

const ensureDatabase = async () => {
  console.log('\nSynchronizing the Prisma schema (npx prisma db push)...');

  const prismaArgs = ['prisma', 'db', 'push', '--skip-generate'];
  const acceptDataLoss = process.env.SHARE_ACCEPT_DATA_LOSS !== 'false';

  if (acceptDataLoss) {
    prismaArgs.push('--accept-data-loss');
    console.warn(
      '\nPassing --accept-data-loss to ensure Prisma can update the schema without interactive prompts.\n' +
        'Set SHARE_ACCEPT_DATA_LOSS=false before running npm run share if you prefer to review warnings manually.'
    );
  }

  try {
    await runCommand('npx', prismaArgs, {
      cwd,
      env: nextEnv,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('\nFailed to synchronize the database schema.');
    if (error) {
      console.error(error.message ?? error);
    }
    process.exit(1);
  }
};

const startNextServer = () => {
  nextProcess = spawn('npm', ['run', 'start'], {
    cwd,
    env: nextEnv,
    stdio: 'inherit',
    shell: process.platform === 'win32',
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
};

const bootstrap = async () => {
  await ensureDatabase();
  startNextServer();
  await startTunnel();
};

bootstrap();
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
