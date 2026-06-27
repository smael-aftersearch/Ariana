import { execFileSync } from 'node:child_process';

try {
  execFileSync('node', [
    'scripts/template-diagnostics.mjs',
    'tests/fixtures/template-diagnostics/page.component.html',
    'tests/fixtures/template-diagnostics/page.component.ts'
  ], { stdio: 'pipe' });
  throw new Error('Expected template diagnostics fixture to report errors.');
} catch (error) {
  const output = String(error.stdout ?? '') + String(error.stderr ?? '');
  if (!output.includes('ARI_TYPE_UNKNOWN_PROPERTY')) throw new Error('Expected unknown property diagnostic in fixture output.');
  if (!output.includes('ARI_TYPE_METHOD_ARGUMENT_COUNT')) throw new Error('Expected method argument count diagnostic in fixture output.');
  if (!output.includes('page.component.html')) throw new Error('Expected formatted template file name in fixture output.');
  console.log('Template diagnostics fixture check passed.');
}
