import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const testsDir = join(root, 'tests', 'unit');
const tests = [];

export function test(name, callback) {
  tests.push({ name, callback });
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

export function equal(actual, expected, message = 'Values are not equal') {
  if (!Object.is(actual, expected)) throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
}

export function deepEqual(actual, expected, message = 'Values are not deeply equal') {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${message}. Expected ${right}, got ${left}`);
}

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
