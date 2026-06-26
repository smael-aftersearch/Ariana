import type { Injector } from '../di/index.js';
import type { ComponentOptions } from '../component/index.js';
import type { CleanupScope } from '../reactivity/index.js';
import { injectStyle } from './style.js';

export type CompiledRenderContext = {
  injector: Injector;
  cleanupScope?: CleanupScope;
};

export type CompiledRenderFunction<T = unknown> = (
  component: T,
  host: HTMLElement,
  context: CompiledRenderContext
) => void | (() => void);

export function renderCompiledComponent<T>(
  component: T,
  metadata: ComponentOptions,
  host: HTMLElement,
  injector: Injector,
  cleanupScope?: CleanupScope
) {
  if (!metadata.render) {
    throw new Error(`Component ${metadata.selector} does not have a compiled render function.`);
  }

  injectStyle(metadata.selector, metadata.style);

  const componentHost = host.matches(metadata.selector)
    ? host
    : document.createElement(metadata.selector);

  componentHost.replaceChildren();
  const cleanup = metadata.render(component, componentHost, { injector, cleanupScope });
  if (cleanup && cleanupScope) cleanupScope.add(cleanup);

  if (componentHost !== host) {
    host.replaceChildren(componentHost);
  }

  return cleanup;
}
