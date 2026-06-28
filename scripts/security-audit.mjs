import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { run } from './lib/run-command.mjs';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', '.turbo', '.next', '.vite']);
const ignoredExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.zip', '.tgz', '.gz', '.br', '.wasm', '.map']);
const textFileLimitBytes = 750_000;

const secretPatterns = [
  ['private key block', /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9_]{30,}/],
  ['npm token', /npm_[A-Za-z0-9]{30,}/],
  ['AWS access key id', /AKIA[0-9A-Z]{16}/],
  ['Google API key', /AIza[0-9A-Za-z\-_]{35}/],
  ['Slack token', /xox[baprs]-[0-9A-Za-z-]{20,}/],
  ['generic secret assignment', /(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*['\"][^'\"]{16,}['\"]/i]
];

const dangerousPatterns = [
  ['eval usage', /\beval\s*\(/],
  ['new Function usage', /new\s+Function\s*\(/],
  ['innerHTML assignment', /\.innerHTML\s*=/],
  ['document.write usage', /document\.write\s*\(/],
  ['child_process exec usage', /\bexec\s*\(/]
];

const findings = [];

runDependencyAudits();
scanDirectory(root);

if (findings.length > 0) {
  console.error('\nSecurity audit failed. Findings:');
  for (const finding of findings) console.error(`- ${finding.file}: ${finding.label}`);
  process.exit(1);
}

console.log('\nSecurity audit passed.');

function runDependencyAudits() {
  const lockDirectories = findLockDirectories(root);

  if (lockDirectories.length === 0) {
    console.log('No package-lock.json files found. Skipping npm audit and running static checks only.');
    return;
  }

  for (const directory of lockDirectories) {
    const label = relative(root, directory) || '.';
    console.log(`\n> npm audit --audit-level=high in ${label}`);
    run('npm', ['audit', '--audit-level=high'], { cwd: directory });
  }
}

function findLockDirectories(directory) {
  const result = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);

    if (!stat.isDirectory()) continue;
    if (existsSync(join(fullPath, 'package-lock.json'))) result.push(fullPath);
    result.push(...findLockDirectories(fullPath));
  }

  if (existsSync(join(directory, 'package-lock.json'))) result.unshift(directory);
  return [...new Set(result)];
}

function scanDirectory(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
      continue;
    }

    if (!stat.isFile() || stat.size > textFileLimitBytes || shouldIgnoreFile(entry)) continue;

    const relativePath = relative(root, fullPath).replaceAll('\\\\', '/');
    const content = readFileSync(fullPath, 'utf8');
    checkFile(relativePath, content);
  }
}

function shouldIgnoreFile(fileName) {
  return ignoredExtensions.has(fileName.slice(fileName.lastIndexOf('.')));
}

function checkFile(file, content) {
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push({ file, label });
  }

  for (const [label, pattern] of dangerousPatterns) {
    if (pattern.test(content) && !isAllowedDangerousUsage(file, label)) findings.push({ file, label });
  }
}

function isAllowedDangerousUsage(file, label) {
  if (label === 'child_process exec usage' && file === 'scripts/lib/run-command.mjs') return true;
  return false;
}
