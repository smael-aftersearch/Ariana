export type Constructor<T = unknown> = new (...args: any[]) => T;

export type Token<T = unknown> = Constructor<T> | symbol | string;

export function createToken<T>(description: string): symbol & { __type?: T } {
  return Symbol(description) as symbol & { __type?: T };
}
