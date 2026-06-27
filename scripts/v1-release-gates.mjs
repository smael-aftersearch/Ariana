import { execFileSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'build']],
  ['npm', ['test']],
  ['npm', ['run', 'check:stable-api-docs']],
  ['npm', ['run', 'check:runtime-lifecycle-docs']],
  ['npm', ['run', 'check:compiler-diagnostics']],
  ['npm', ['run', 'check:template-typecheck-docs']],
  ['npm', ['run', 'check:template-diagnostics-fixture']],
  ['npm', ['run', 'check:vite-plugin-v1-docs']],
  ['npm', ['run', 'smoke:runtime-lifecycle']],
  ['npm', ['run', 'smoke:vite-plugin-options']],
  ['npm', ['run', 'bench:smoke']],
  ['npm', ['run', 'pack:v1:candidate']]
];

for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
}

console.log('\nAriana 1.0 release gates passed.');
