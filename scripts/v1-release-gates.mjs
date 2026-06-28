import { run } from './lib/run-command.mjs';

const commands = [
  ['npm', ['run', 'build']],
  ['npm', ['test']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'security:audit']],
  ['npm', ['run', 'check:stable-api-docs']],
  ['npm', ['run', 'check:runtime-lifecycle-docs']],
  ['npm', ['run', 'check:compiler-diagnostics']],
  ['npm', ['run', 'check:template-typecheck-docs']],
  ['npm', ['run', 'check:template-diagnostics-fixture']],
  ['npm', ['run', 'check:vite-plugin-v1-docs']],
  ['npm', ['run', 'check:scss-styleurl-support']],
  ['node', ['scripts/check-animation-api-support.mjs']],
  ['npm', ['run', 'smoke:runtime-lifecycle']],
  ['npm', ['run', 'smoke:vite-plugin-options']],
  ['npm', ['run', 'bench:smoke']],
  ['npm', ['run', 'pack:v1:candidate']]
];

for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  run(command, args);
}

console.log('\nAriana release gates passed.');
