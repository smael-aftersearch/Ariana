export type RouteTransition = {
  enter?: string;
  leave?: string;
};

export type RouteTransitionState = {
  readonly enter: readonly string[];
  readonly leave: readonly string[];
};

export function normalizeRouteTransition(transition?: RouteTransition): RouteTransitionState {
  return {
    enter: normalizeClassList(transition?.enter),
    leave: normalizeClassList(transition?.leave)
  };
}

export function hasRouteTransition(transition?: RouteTransition): boolean {
  const normalized = normalizeRouteTransition(transition);
  return normalized.enter.length > 0 || normalized.leave.length > 0;
}

export function applyRouteEnter(element: Element, transition?: RouteTransition): void {
  const classes = normalizeRouteTransition(transition).enter;
  if (classes.length === 0) return;
  requestAnimationFrame(() => element.classList.add(...classes));
}

export function runRouteLeave(element: Element, transition?: RouteTransition): Promise<void> {
  const classes = normalizeRouteTransition(transition).leave;
  if (classes.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    let settled = false;
    let timeout = 0;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve();
    };

    element.addEventListener('animationend', finish, { once: true });
    element.addEventListener('transitionend', finish, { once: true });
    element.classList.add(...classes);

    const fallbackMs = Math.min(Math.max(readMotionDurationMs(element) + 80, 120), 5000);
    if (fallbackMs <= 120) finish();
    else timeout = setTimeout(finish, fallbackMs);
  });
}

export async function replaceWithRouteTransition(host: Element, next: Node | DocumentFragment, transition?: RouteTransition): Promise<void> {
  if (!hasRouteTransition(transition)) {
    host.replaceChildren(next);
    return;
  }

  const leaving = Array.from(host.childNodes).filter(isElementNode);
  if (leaving.length > 0) {
    await Promise.all(leaving.map(node => runRouteLeave(node, transition)));
  }

  host.replaceChildren(next);
  for (const element of Array.from(host.children)) applyRouteEnter(element, transition);
}

function normalizeClassList(value: string | undefined): readonly string[] {
  if (!value) return [];
  const classes = value.trim().split(/\s+/).filter(Boolean);
  for (const className of classes) {
    if (!/^-?[A-Za-z_][A-Za-z0-9_-]*$/.test(className)) {
      throw new Error(`Invalid Ariana route transition class name: ${className}`);
    }
  }
  return classes;
}

function readMotionDurationMs(element: Element): number {
  const style = getComputedStyle(element);
  return Math.max(
    readTimeListMs(style.animationDuration) + readTimeListMs(style.animationDelay),
    readTimeListMs(style.transitionDuration) + readTimeListMs(style.transitionDelay)
  );
}

function readTimeListMs(value: string): number {
  return value.split(',').reduce((max, part) => {
    const text = part.trim();
    const amount = Number.parseFloat(text) || 0;
    const ms = text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount;
    return Math.max(max, ms);
  }, 0);
}

function isElementNode(node: Node): node is Element {
  return node.nodeType === 1;
}
