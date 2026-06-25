declare module 'node:path' {
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string;
}
