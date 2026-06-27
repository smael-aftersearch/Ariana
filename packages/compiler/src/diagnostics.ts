import { getSourceLocation, type ArianaTemplateDiagnostic } from './index.js';

export type FormatTemplateDiagnosticOptions = {
  fileName?: string;
  includeSourceLine?: boolean;
};

export function formatTemplateDiagnostic(
  source: string,
  diagnostic: ArianaTemplateDiagnostic,
  options: FormatTemplateDiagnosticOptions = {}
): string {
  const location = diagnostic.location ?? getSourceLocation(source, diagnostic.index);
  const filePrefix = options.fileName ? `${options.fileName}:` : '';
  const headline = `${filePrefix}${location.line}:${location.column} ${diagnostic.level.toUpperCase()} ${diagnostic.code}: ${diagnostic.message}`;

  if (!options.includeSourceLine) return headline;

  const line = getSourceLine(source, location.line);
  const pointer = `${' '.repeat(Math.max(0, location.column - 1))}^`;
  return `${headline}\n${line}\n${pointer}`;
}

export function formatTemplateDiagnostics(
  source: string,
  diagnostics: readonly ArianaTemplateDiagnostic[],
  options: FormatTemplateDiagnosticOptions = {}
): string {
  return diagnostics.map(diagnostic => formatTemplateDiagnostic(source, diagnostic, options)).join('\n');
}

export function getSourceLine(source: string, line: number): string {
  return source.split(/\r?\n/)[Math.max(0, line - 1)] ?? '';
}
