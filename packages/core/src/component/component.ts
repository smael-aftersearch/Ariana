import {
  COMPONENT_METADATA,
  ROUTE_METADATA,
  type ComponentOptions,
  type ComponentType,
  type RouteOptions
} from './metadata.js';

export function Component(options: ComponentOptions) {
  return function componentDecorator(target: ComponentType) {
    target[COMPONENT_METADATA] = options;
  };
}

export function Route(path: string | RouteOptions) {
  const options = typeof path === 'string' ? { path } : path;

  return function routeDecorator(target: ComponentType) {
    target[ROUTE_METADATA] = options;
  };
}

export function getComponentMetadata(componentType: ComponentType): ComponentOptions {
  const metadata = componentType[COMPONENT_METADATA];

  if (!metadata) {
    throw new Error(`Class ${componentType.name} is not an Ariana component.`);
  }

  return metadata;
}

export function getRouteMetadata(componentType: ComponentType): RouteOptions | undefined {
  return componentType[ROUTE_METADATA];
}
