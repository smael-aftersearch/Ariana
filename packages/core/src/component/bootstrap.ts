import { Injector, runInInjectionContext, type Provider } from '../di/index.js';
import { createCleanupScope, type CleanupScope } from '../reactivity/index.js';
import { renderCompiledComponent } from '../template/compiled.js';
import { getComponentMetadata } from './component.js';
import type { ComponentType } from './metadata.js';

export type BootstrapOptions = {
  providers?: Provider[];
};

export type BootstrapRef<T> = {
  readonly instance: T;
  readonly injector: Injector;
  readonly cleanupScope: CleanupScope;
  readonly destroyed: boolean;
  destroy(): void;
};

export type MountOptions = BootstrapOptions & {
  clearHostOnDestroy?: boolean;
};

export type MountRef<T> = BootstrapRef<T>;

export function bootstrap<T>(
  componentType: ComponentType<T>,
  host: string | HTMLElement,
  options: BootstrapOptions = {}
): T {
  return bootstrapApplication(componentType, host, options).instance;
}

export function bootstrapApplication<T>(
  componentType: ComponentType<T>,
  host: string | HTMLElement,
  options: BootstrapOptions = {}
): BootstrapRef<T> {
  return mountComponent(componentType, host, { ...options, clearHostOnDestroy: true });
}

export function mountComponent<T>(
  componentType: ComponentType<T>,
  host: string | HTMLElement,
  options: MountOptions = {}
): MountRef<T> {
  const hostElement = typeof host === 'string'
    ? document.querySelector(host)
    : host;

  if (!hostElement) {
    throw new Error(`Ariana mount failed: host element not found (${String(host)}).`);
  }

  const metadata = getComponentMetadata(componentType);
  const cleanupScope = createCleanupScope();
  const rootInjector = new Injector(options.providers ?? []);
  const componentInjector = rootInjector.createChild(metadata.providers ?? []);
  const component = runInInjectionContext(componentInjector, () => new componentType());
  let destroyed = false;

  if (!metadata.render) {
    const hint = metadata.templateUrl
      ? ` The Vite plugin must transform templateUrl (${metadata.templateUrl}) into a compiled render function.`
      : ' Use the compiler or Vite plugin to provide a compiled render function.';

    throw new Error(`Component ${metadata.selector} does not have a compiled render function.${hint}`);
  }

  renderCompiledComponent(component, metadata, hostElement as HTMLElement, componentInjector, cleanupScope);

  if (hasLifecycle(component, 'onInit')) component.onInit();
  if (hasLifecycle(component, 'afterRender')) component.afterRender();

  return {
    instance: component,
    injector: componentInjector,
    cleanupScope,
    get destroyed() { return destroyed; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (hasLifecycle(component, 'onDestroy')) component.onDestroy();
      cleanupScope.cleanup();
      if (options.clearHostOnDestroy ?? false) (hostElement as HTMLElement).replaceChildren();
    }
  };
}

function hasLifecycle<TName extends string>(
  instance: unknown,
  method: TName
): instance is Record<TName, () => void> {
  return Boolean(
    instance &&
    typeof instance === 'object' &&
    method in instance &&
    typeof (instance as Record<TName, unknown>)[method] === 'function'
  );
}
