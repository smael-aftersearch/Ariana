import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tests } from './test-api.mjs';

const root = process.cwd();
const testsDir = join(root, 'tests', 'unit');

function findTestFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) result.push(...findTestFiles(fullPath));
    else if (entry.endsWith('.test.mjs')) result.push(fullPath);
  }
  return result.sort();
}

async function main() {
  for (const file of findTestFiles(testsDir)) {
    await import(pathToFileURL(file).href);
  }

  let passed = 0;
  let failed = 0;

  for (const item of tests) {
    try {
      await item.callback();
      passed++;
      console.log(`ok - ${item.name}`);
    } catch (error) {
      failed++;
      console.error(`not ok - ${item.name}`);
      console.error(error?.stack ?? error);
    }
  }

  console.log(`\nUnit tests: ${passed} passed, ${failed} failed`);

  if (failed > 0) process.exit(1);
}

main().catch(error => {
  console.error(error?.stack ?? error);
  process.exit(1);
});
