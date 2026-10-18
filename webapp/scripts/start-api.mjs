import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webappDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = path.resolve(webappDir, '..');
const windows = process.platform === 'win32';
const venvDir = path.join(repoDir, '.venv');
const venvPython = path.join(venvDir, windows ? 'Scripts' : 'bin', windows ? 'python.exe' : 'python');
const systemPython = windows ? 'python' : 'python3';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: repoDir, stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code: code ?? 1, signal, child }));
  });
}

async function start() {
  if (!existsSync(venvPython)) {
    console.log('Creating the repository Python virtual environment...');
    const result = await run(systemPython, ['-m', 'venv', venvDir]);
    if (result.code !== 0) throw new Error('Could not create .venv. Install Python and try again.');
  }

  const imports = await run(venvPython, ['-c', 'import fastapi, uvicorn, requests, multipart, dotenv'], { stdio: 'ignore' });
  if (imports.code !== 0) {
    console.log('Installing backend requirements into .venv...');
    const install = await run(venvPython, ['-m', 'pip', 'install', '-r', path.join(repoDir, 'requirements.txt')]);
    if (install.code !== 0) throw new Error('Could not install backend requirements. Check Python and network access, then try again.');
  }

  console.log(`Starting NutriGenie API from ${repoDir}`);
  console.log(`Using ${venvPython}`);
  const server = spawn(venvPython, ['-m', 'uvicorn', 'nutrigenie_api:app', '--reload', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: repoDir,
    stdio: 'inherit',
  });

  server.on('error', (error) => {
    console.error(`Could not start the API: ${error.message}`);
    process.exitCode = 1;
  });
  server.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 0;
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.kill(signal));
  }
}

start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
