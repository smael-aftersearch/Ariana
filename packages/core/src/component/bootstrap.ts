import { Injector, runInInjectionContext, type Provider } from '../di/index.js';
import { createCleanupScope, type CleanupScope } from '../reactivity/index.js';
import { renderCompiledComponent } from '../template/compiled.js';
import { renderComponent } from '../template/render.js';
import { getComponentMetadata } from './component.js';
import type { ComponentType } from './metadata.js';

export type BootstrapOptions = {
  providers?: Provider[];
};

export type BootstrapRef<T> = {
  readonly instance: T;
  readonly injector: Injector;
  readonly cleanupScope: CleanupScope;
  destroy(): void;
};

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
  const hostElement = typeof host === 'string'
    ? document.querySelector(host)
    : host;

  if (!hostElement) {
    throw new Error(`Ariana bootstrap failed: host element not found (${String(host)}).`);
  }

  const metadata = getComponentMetadata(componentType);
  const cleanupScope = createCleanupScope();
  const rootInjector = new Injector(options.providers ?? []);
  const componentInjector = rootInjector.createChild(metadata.providers ?? []);
  const component = runInInjectionContext(componentInjector, () => new componentType());

  if (metadata.render) {
    renderCompiledComponent(component, metadata, hostElement as HTMLElement, componentInjector, cleanupScope);
  } else {
    const cleanup = renderComponent(component, metadata, hostElement as HTMLElement, componentInjector);
    if (typeof cleanup === 'function') cleanupScope.add(cleanup);
  }

  if (hasLifecycle(component, 'onInit')) component.onInit();
  if (hasLifecycle(component, 'afterRender')) component.afterRender();

  return {
    instance: component,
    injector: componentInjector,
    cleanupScope,
    destroy() {
      if (hasLifecycle(component, 'onDestroy')) component.onDestroy();
      cleanupScope.cleanup();
      (hostElement as HTMLElement).replaceChildren();
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
