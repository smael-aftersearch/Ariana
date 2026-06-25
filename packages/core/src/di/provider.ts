import type { Constructor, Token } from './token.js';

export type ClassProvider<T = unknown> = {
  token: Token<T>;
  useClass: Constructor<T>;
};

export type ValueProvider<T = unknown> = {
  token: Token<T>;
  useValue: T;
};

export type FactoryProvider<T = unknown> = {
  token: Token<T>;
  useFactory: () => T;
};

export type Provider<T = unknown> =
  | Constructor<T>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>;

export function provide<T>(token: Token<T>, value?: {
  useClass?: Constructor<T>;
  useValue?: T;
  useFactory?: () => T;
}): Provider<T> {
  if (!value) {
    if (typeof token === 'function') {
      return token as Constructor<T>;
    }

    throw new Error('Ariana provider needs useClass, useValue, or useFactory for non-class tokens.');
  }

  if ('useValue' in value) {
    return { token, useValue: value.useValue as T };
  }

  if (value.useFactory) {
    return { token, useFactory: value.useFactory };
  }

  if (value.useClass) {
    return { token, useClass: value.useClass };
  }

  throw new Error('Invalid Ariana provider.');
}
