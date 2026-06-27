import { execFileSync } from 'node:child_process';

export function bin(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

export function run(command, args, options = {}) {
  return execFileSync(bin(command), args, {
    stdio: 'inherit',
    ...options
  });
}

export function runNode(args, options = {}) {
  return execFileSync(process.execPath, args, {
    stdio: 'inherit',
    ...options
  });
}
