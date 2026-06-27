import { readFileSync } from 'node:fs';
import { test, assert } from './test-api.mjs';

test('bootstrap: exposes destroyed state and idempotent destroy path', () => {
  const source = readFileSync('packages/core/src/component/bootstrap.ts', 'utf8');
  assert(source.includes('readonly destroyed: boolean'), 'BootstrapRef should expose destroyed state');
  assert(source.includes('let destroyed = false'), 'bootstrapApplication should track destroyed state');
  assert(source.includes('if (destroyed) return'), 'destroy should be idempotent');
  assert(source.includes('cleanupScope.cleanup()'), 'destroy should cleanup scope');
  assert(source.includes('replaceChildren()'), 'destroy should clear host');
});
