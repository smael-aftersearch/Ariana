import { existsSync, readFileSync } from 'node:fs';

const bootstrapSource = readFileSync('packages/core/src/component/bootstrap.ts', 'utf8');
const compiledSource = readFileSync('packages/core/src/template/compiled.ts', 'utf8');
const scopeSource = readFileSync('packages/core/src/reactivity/scope.ts', 'utf8');

const required = [
  [bootstrapSource, 'renderCompiledComponent', 'bootstrap should use compiled renderer'],
  [bootstrapSource, 'does not have a compiled render function', 'bootstrap should fail clearly without compiled render'],
  [bootstrapSource, 'destroyed', 'bootstrap ref should expose destroyed state'],
  [bootstrapSource, 'cleanupScope.cleanup()', 'bootstrap destroy should cleanup scope'],
  [compiledSource, 'if (cleanup && cleanupScope) cleanupScope.add(cleanup)', 'compiled render cleanup should be registered in cleanup scope'],
  [compiledSource, 'host.replaceChildren(componentHost)', 'compiled renderer should replace host children safely'],
  [scopeSource, 'child()', 'cleanup scope should support child scopes'],
  [scopeSource, 'childScope.cleanup()', 'child scope should be cleaned by parent scope'],
  [scopeSource, 'cleaned', 'cleanup scope should expose cleaned state']
];

for (const [source, fragment, message] of required) {
  if (!source.includes(fragment)) throw new Error(`${message}: missing ${fragment}`);
}

if (existsSync('packages/core/src/template/render.ts')) {
  throw new Error('legacy template renderer file should not exist in core');
}

if (existsSync('packages/core/src/template/expression.ts')) {
  throw new Error('legacy template expression file should not exist in core');
}

console.log('Runtime lifecycle smoke passed.');
