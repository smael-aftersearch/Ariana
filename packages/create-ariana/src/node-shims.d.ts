declare const process: {
  argv: string[];
  cwd(): string;
};

declare module 'node:fs' {
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
}

declare module 'node:path' {
  export function join(...paths: string[]): string;
}
