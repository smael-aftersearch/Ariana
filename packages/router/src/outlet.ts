import { mountComponent, type ComponentType, type MountRef, type Provider } from '@ariana/core';
import type { RouteMatch, Router } from './index.js';
import { applyRouteEnter, hasRouteTransition, runRouteLeave } from './transitions.js';

export type RouterOutletOptions = {
  providers?: readonly Provider[];
  wrapperClass?: string;
};

export type RouterOutlet = {
  readonly host: HTMLElement;
  readonly router: Router;
  render(): Promise<boolean>;
  destroy(): void;
};

type ActiveRouteView = {
  readonly match: RouteMatch;
  readonly element: HTMLElement;
  readonly ref: MountRef<unknown>;
};

export function createRouterOutlet(
  router: Router,
  host: string | HTMLElement,
  options: RouterOutletOptions = {}
): RouterOutlet {
  const hostElement = resolveHost(host);
  let active: ActiveRouteView | undefined;
  let renderToken = 0;
  let destroyed = false;

  async function render(): Promise<boolean> {
    if (destroyed) return false;
    const token = ++renderToken;
    const match = router.currentMatch();
    if (!match) return false;
    if (active?.match === match) return true;

    const nextElement = createRouteHost(options.wrapperClass);
    const ref = mountComponent(match.route.component as ComponentType<unknown>, nextElement, {
      providers: [...match.providers, ...(options.providers ?? [])],
      clearHostOnDestroy: false
    });
    const previous = active;
    active = { match, element: nextElement, ref };

    if (previous) {
      await leaveAndDestroy(previous);
      if (destroyed || token !== renderToken) {
        ref.destroy();
        nextElement.remove();
        return false;
      }
    }

    hostElement.replaceChildren(nextElement);
    if (hasRouteTransition(match.transition)) applyRouteEnter(nextElement, match.transition);
    return true;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    renderToken++;
    if (active) {
      active.ref.destroy();
      active.element.remove();
      active = undefined;
    }
    hostElement.replaceChildren();
  }

  async function leaveAndDestroy(view: ActiveRouteView): Promise<void> {
    if (hasRouteTransition(view.match.transition)) await runRouteLeave(view.element, view.match.transition);
    view.ref.destroy();
    view.element.remove();
  }

  return { host: hostElement, router, render, destroy };
}

function resolveHost(host: string | HTMLElement): HTMLElement {
  const hostElement = typeof host === 'string' ? document.querySelector(host) : host;
  if (!(hostElement instanceof HTMLElement)) {
    throw new Error(`Ariana router outlet failed: host element not found (${String(host)}).`);
  }
  return hostElement;
}

function createRouteHost(wrapperClass: string | undefined): HTMLElement {
  const element = document.createElement('div');
  element.setAttribute('data-ari-router-outlet-view', '');
  if (wrapperClass) element.className = wrapperClass;
  return element;
}
