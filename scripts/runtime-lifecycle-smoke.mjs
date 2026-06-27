import { readFileSync } from 'node:fs';

const renderSource = readFileSync('packages/core/src/template/render.ts', 'utf8');
const bootstrapSource = readFileSync('packages/core/src/component/bootstrap.ts', 'utf8');
const scopeSource = readFileSync('packages/core/src/reactivity/scope.ts', 'utf8');

const required = [
  [renderSource, 'return () => cleanupScope(scope)', 'renderComponent should return render cleanup'],
  [renderSource, 'childCleanup();', 'child render cleanup should run from parent cleanup'],
  [renderSource, 'onDestroy', 'child destroy hook should be wired'],
  [renderSource, 'removeEventListener', 'event listener cleanup should be registered'],
  [bootstrapSource, 'destroyed', 'bootstrap ref should expose destroyed state'],
  [bootstrapSource, 'cleanupScope.cleanup()', 'bootstrap destroy should cleanup scope'],
  [scopeSource, 'createChild', 'cleanup scope should support child scopes'],
  [scopeSource, 'isCleaned', 'cleanup scope should expose cleaned state']
];

for (const [source, fragment, message] of required) {
  if (!source.includes(fragment)) throw new Error(`${message}: missing ${fragment}`);
}

console.log('Runtime lifecycle smoke passed.');
