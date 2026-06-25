import type { Constructor, Token } from './token.js';
import type { Provider } from './provider.js';

export class Injector {
  private readonly records = new Map<Token, Provider>();
  private readonly instances = new Map<Token, unknown>();

  constructor(
    providers: Provider[] = [],
    private readonly parent?: Injector
  ) {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  register(provider: Provider) {
    if (typeof provider === 'function') {
      this.records.set(provider, provider);
      return;
    }

    this.records.set(provider.token, provider);
  }

  get<T>(token: Token<T>): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    const provider = this.records.get(token);

    if (!provider) {
      if (this.parent) {
        return this.parent.get(token);
      }

      if (typeof token === 'function') {
        return this.instantiate(token as Constructor<T>, token);
      }

      throw new Error(`Ariana DI failed: no provider found for token ${String(token)}.`);
    }

    if (typeof provider === 'function') {
      return this.instantiate(provider as Constructor<T>, provider);
    }

    if ('useValue' in provider) {
      this.instances.set(token, provider.useValue);
      return provider.useValue as T;
    }

    if ('useFactory' in provider) {
      const value = runInInjectionContext(this, provider.useFactory);
      this.instances.set(token, value);
      return value as T;
    }

    return this.instantiate(provider.useClass as Constructor<T>, token);
  }

  createChild(providers: Provider[] = []): Injector {
    return new Injector(providers, this);
  }

  private instantiate<T>(constructor: Constructor<T>, token: Token): T {
    const instance = runInInjectionContext(this, () => new constructor());
    this.instances.set(token, instance);
    return instance;
  }
}

let currentInjector: Injector | undefined;

export function inject<T>(token: Token<T>): T {
  if (!currentInjector) {
    throw new Error('Ariana inject() can only be used while creating a component or provider.');
  }

  return currentInjector.get(token);
}

export function runInInjectionContext<T>(injector: Injector, callback: () => T): T {
  const previous = currentInjector;
  currentInjector = injector;

  try {
    return callback();
  } finally {
    currentInjector = previous;
  }
}
