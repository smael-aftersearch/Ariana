import type { Injector } from '../di/index.js';
import { runInInjectionContext } from '../di/index.js';
import type { ComponentOptions, ComponentType } from '../component/index.js';
import { getComponentMetadata } from '../component/index.js';
import { effect } from '../reactivity/index.js';
import { transformControlFlow } from './control-flow.js';
import { evaluateExpression, evaluateStatement, type Locals } from './expression.js';
import { injectStyle } from './style.js';

type RenderScope = {
  cleanups: Array<() => void>;
};

export function renderComponent(
  component: unknown,
  metadata: ComponentOptions,
  host: HTMLElement,
  injector: Injector
): () => void {
  const template = metadata.template;

  if (!template) {
    const hint = metadata.templateUrl
      ? ` The Vite plugin must transform templateUrl (${metadata.templateUrl}) into template.`
      : '';

    throw new Error(`Component ${metadata.selector} does not have a template.${hint}`);
  }

  injectStyle(metadata.selector, metadata.style);

  const componentHost = host.matches(metadata.selector)
    ? host
    : document.createElement(metadata.selector);

  componentHost.innerHTML = transformControlFlow(template);

  const scope: RenderScope = { cleanups: [] };
  bindTree(componentHost, component, injector, metadata, {}, scope);

  if (componentHost !== host) {
    host.innerHTML = '';
    host.appendChild(componentHost);
  }

  return () => cleanupScope(scope);
}

function bindTree(
  root: ParentNode,
  context: unknown,
  injector: Injector,
  metadata: ComponentOptions,
  locals: Locals,
  scope: RenderScope
) {
  bindControlFlow(root, context, injector, metadata, locals, scope);
  bindChildComponents(root, context, injector, metadata, locals, scope);
  bindTextInterpolations(root, context, locals, scope);
  bindAttributes(root, context, locals, scope);
}

function bindControlFlow(
  root: ParentNode,
  context: unknown,
  injector: Injector,
  metadata: ComponentOptions,
  locals: Locals,
  scope: RenderScope
) {
  for (const template of Array.from(root.querySelectorAll('template[data-ari-if]')) as HTMLTemplateElement[]) {
    mountIf(template, context, injector, metadata, locals, scope);
  }

  for (const template of Array.from(root.querySelectorAll('template[data-ari-for-item]')) as HTMLTemplateElement[]) {
    mountFor(template, context, injector, metadata, locals, scope);
  }
}

function mountIf(
  template: HTMLTemplateElement,
  context: unknown,
  injector: Injector,
  metadata: ComponentOptions,
  locals: Locals,
  parentScope: RenderScope
) {
  const expression = template.dataset.ariIf ?? '';
  const anchor = document.createComment(`ari-if: ${expression}`);
  const mountedNodes: Node[] = [];
  let childScope: RenderScope | undefined;

  template.replaceWith(anchor);

  const cleanup = effect(() => {
    const shouldRender = Boolean(evaluateExpression(expression, context, locals));

    if (!shouldRender) {
      cleanupNodes(mountedNodes, childScope);
      childScope = undefined;
      return;
    }

    if (mountedNodes.length > 0) return;

    childScope = { cleanups: [] };
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const nodes = Array.from(fragment.childNodes);

    bindTree(fragment, context, injector, metadata, locals, childScope);
    anchor.parentNode?.insertBefore(fragment, anchor);
    mountedNodes.push(...nodes);
  });

  parentScope.cleanups.push(cleanup);
  parentScope.cleanups.push(() => cleanupNodes(mountedNodes, childScope));
}

function mountFor(
  template: HTMLTemplateElement,
  context: unknown,
  injector: Injector,
  metadata: ComponentOptions,
  locals: Locals,
  parentScope: RenderScope
) {
  const itemName = template.dataset.ariForItem ?? 'item';
  const iterableExpression = template.dataset.ariForOf ?? '[]';
  const anchor = document.createComment(`ari-for: ${itemName} of ${iterableExpression}`);
  const mountedNodes: Node[] = [];
  const childScopes: RenderScope[] = [];

  template.replaceWith(anchor);

  const cleanup = effect(() => {
    cleanupNodes(mountedNodes);
    for (const childScope of childScopes.splice(0)) cleanupScope(childScope);

    const value = evaluateExpression<unknown>(iterableExpression, context, locals);
    const items = Array.isArray(value) ? value : Array.from(value as Iterable<unknown> ?? []);
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const itemScope: RenderScope = { cleanups: [] };
      const itemLocals = { ...locals, [itemName]: item, $index: index };
      const itemFragment = template.content.cloneNode(true) as DocumentFragment;
      const nodes = Array.from(itemFragment.childNodes);

      bindTree(itemFragment, context, injector, metadata, itemLocals, itemScope);
      childScopes.push(itemScope);
      mountedNodes.push(...nodes);
      fragment.appendChild(itemFragment);
    });

    anchor.parentNode?.insertBefore(fragment, anchor);
  });

  parentScope.cleanups.push(cleanup);
  parentScope.cleanups.push(() => {
    cleanupNodes(mountedNodes);
    for (const childScope of childScopes.splice(0)) cleanupScope(childScope);
  });
}

function bindTextInterpolations(root: ParentNode, context: unknown, locals: Locals, scope: RenderScope) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const original = node.nodeValue ?? '';
    if (!original.includes('{{')) continue;

    scope.cleanups.push(effect(() => {
      node.nodeValue = original.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expression: string) => {
        const value = evaluateExpression(expression, context, locals);
        return String(value ?? '');
      });
    }));
  }
}

function bindAttributes(root: ParentNode, context: unknown, locals: Locals, scope: RenderScope) {
  for (const element of getElements(root)) {
    for (const attr of Array.from(element.attributes)) {
      const eventMatch = attr.name.match(/^\((.+)\)$/);
      const propertyMatch = attr.name.match(/^\[(.+)\]$/);
      const classMatch = attr.name.match(/^\[class\.(.+)\]$/);

      if (eventMatch) {
        const eventName = eventMatch[1];
        const statement = attr.value;
        const listener = (event: Event) => evaluateStatement(statement, context, { ...locals, $event: event });
        element.addEventListener(eventName, listener);
        element.removeAttribute(attr.name);
        scope.cleanups.push(() => element.removeEventListener(eventName, listener));
        continue;
      }

      if (classMatch) {
        const className = classMatch[1];
        const expression = attr.value;
        scope.cleanups.push(effect(() => {
          element.classList.toggle(className, Boolean(evaluateExpression(expression, context, locals)));
        }));
        element.removeAttribute(attr.name);
        continue;
      }

      if (propertyMatch) {
        const propertyName = propertyMatch[1];
        const expression = attr.value;
        scope.cleanups.push(effect(() => setProperty(element, propertyName, evaluateExpression(expression, context, locals))));
        element.removeAttribute(attr.name);
      }
    }
  }
}

function bindChildComponents(
  root: ParentNode,
  context: unknown,
  injector: Injector,
  metadata: ComponentOptions,
  locals: Locals,
  scope: RenderScope
) {
  for (const childType of metadata.components ?? []) {
    const childMetadata = getComponentMetadata(childType as ComponentType);
    const hosts = Array.from(root.querySelectorAll(childMetadata.selector)) as HTMLElement[];

    for (const host of hosts) {
      const childInjector = injector.createChild(childMetadata.providers ?? []);
      const child = runInInjectionContext(childInjector, () => new childType());
      bindStaticInputs(host, child, context, locals);
      const childCleanup = renderComponent(child, childMetadata, host, childInjector);
      scope.cleanups.push(() => {
        if (typeof (child as { onDestroy?: unknown }).onDestroy === 'function') {
          (child as { onDestroy: () => void }).onDestroy();
        }
        childCleanup();
      });

      if (typeof (child as { onInit?: unknown }).onInit === 'function') {
        (child as { onInit: () => void }).onInit();
      }
    }
  }
}

function bindStaticInputs(host: HTMLElement, child: unknown, context: unknown, locals: Locals) {
  for (const attr of Array.from(host.attributes)) {
    const propertyMatch = attr.name.match(/^\[(.+)\]$/);
    if (!propertyMatch) continue;
    (child as Record<string, unknown>)[propertyMatch[1]] = evaluateExpression(attr.value, context, locals);
  }
}

function getElements(root: ParentNode): Element[] {
  if (root instanceof Element) return [root, ...Array.from(root.querySelectorAll('*'))];
  return Array.from(root.querySelectorAll('*'));
}

function cleanupNodes(nodes: Node[], scope?: RenderScope) {
  while (nodes.length > 0) {
    const node = nodes.pop();
    if (node?.parentNode) node.parentNode.removeChild(node);
  }
  if (scope) cleanupScope(scope);
}

function cleanupScope(scope: RenderScope) {
  for (const cleanup of scope.cleanups.splice(0)) cleanup();
}

function setProperty(element: Element, propertyName: string, value: unknown) {
  if (propertyName in element) {
    (element as unknown as Record<string, unknown>)[propertyName] = value;
  } else if (value === false || value == null) {
    element.removeAttribute(propertyName);
  } else {
    element.setAttribute(propertyName, String(value));
  }
}
