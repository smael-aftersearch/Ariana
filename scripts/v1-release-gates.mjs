import { execFileSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'build']],
  ['npm', ['test']],
  ['npm', ['run', 'check:stable-api-docs']],
  ['npm', ['run', 'check:runtime-lifecycle-docs']],
  ['npm', ['run', 'check:compiler-diagnostics']],
  ['npm', ['run', 'check:template-typecheck-docs']],
  ['npm', ['run', 'check:template-diagnostics-fixture']],
  ['node', ['scripts/check-vite-plugin-v1-docs.mjs']],
  ['node', ['scripts/vite-plugin-options-smoke.mjs']],
  ['node', ['scripts/bench-smoke.mjs']],
  ['node', ['scripts/pack-v1-candidate.mjs']]
];

for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
}

console.log('\nAriana 1.0 release gates passed.');
