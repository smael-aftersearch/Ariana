import { execFileSync } from 'node:child_process';

export function run(command, args, options = {}) {
  if (process.platform === 'win32') {
    return execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', toWindowsCommandLine(command, args)], {
      stdio: 'inherit',
      ...options
    });
  }

  return execFileSync(command, args, {
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

function toWindowsCommandLine(command, args) {
  return [command, ...args].map(quoteWindowsArg).join(' ');
}

function quoteWindowsArg(value) {
  const text = String(value);
  if (!/[\s"&()^|<>]/.test(text)) return text;
  return `"${text.replaceAll('"', '\\"')}"`;
}
