import type { Constructor, Provider } from '../di/index.js';

export type ComponentOptions = {
  selector: string;
  templateUrl?: string;
  template?: string;
  styleUrl?: string;
  style?: string;
  components?: Constructor[];
  providers?: Provider[];
};

export type RouteOptions = {
  path: string;
};

export const COMPONENT_METADATA = Symbol('ariana.component');
export const ROUTE_METADATA = Symbol('ariana.route');

export type ComponentType<T = unknown> = Constructor<T> & {
  [COMPONENT_METADATA]?: ComponentOptions;
  [ROUTE_METADATA]?: RouteOptions;
};
