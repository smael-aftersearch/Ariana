export const tests = [];

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
