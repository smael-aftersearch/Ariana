export type Locals = Record<string, unknown>;

export function evaluateExpression<T = unknown>(
  expression: string,
  context: unknown,
  locals: Locals = {}
): T {
  const localNames = Object.keys(locals);
  const localValues = Object.values(locals);

  return new Function(
    ...localNames,
    `with (this) { return (${expression}); }`
  ).apply(context, localValues) as T;
}

export function evaluateStatement(
  statement: string,
  context: unknown,
  locals: Locals = {}
): unknown {
  const localNames = Object.keys(locals);
  const localValues = Object.values(locals);

  return new Function(
    ...localNames,
    `with (this) { ${statement}; }`
  ).apply(context, localValues);
}
