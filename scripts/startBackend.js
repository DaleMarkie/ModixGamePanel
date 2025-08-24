const fs = require('fs');
const { spawn } = require('child_process');

let pythonPath;

// Try to read custom python path from .backendrc
try {
  pythonPath = fs.readFileSync('.backendrc', 'utf8').trim();
} catch {
  // Default Python based on OS
  pythonPath = process.platform === 'win32' ? 'py' : 'python3';
}

try {
  const child = spawn(pythonPath, ['backend/api_main.py'], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONPATH: 'backend' },
    shell: process.platform === 'win32', // required on Windows
  });

  child.on('exit', (code) => process.exit(code));
} catch (e) {
  console.error('Backend failed to start:', e);
}
