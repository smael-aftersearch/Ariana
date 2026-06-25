export type ArianaTemplateDiagnostic = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  index: number;
};

export type ArianaParseResult = {
  diagnostics: ArianaTemplateDiagnostic[];
};

export function parseTemplateToAst(template: string): ArianaParseResult {
  const diagnostics: ArianaTemplateDiagnostic[] = [];
  collectInterpolationDiagnostics(template, diagnostics);
  collectElementDiagnostics(template, diagnostics);
  collectControlBlockDiagnostics(template, diagnostics);
  return { diagnostics };
}

function collectInterpolationDiagnostics(template: string, diagnostics: ArianaTemplateDiagnostic[]) {
  let index = 0;
  while (index < template.length) {
    const open = template.indexOf('{{', index);
    if (open < 0) return;
    const close = template.indexOf('}}', open + 2);
    if (close < 0) {
      diagnostics.push({ level: 'error', code: 'ARI_UNCLOSED_INTERPOLATION', message: 'Interpolation is missing closing braces.', index: open });
      return;
    }
    index = close + 2;
  }
}

function collectElementDiagnostics(template: string, diagnostics: ArianaTemplateDiagnostic[]) {
  const stack: Array<{ tagName: string; index: number }> = [];
  const tagPattern = /<\/?([A-Za-z][\w-]*)(?:\s[^>]*)?>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(template))) {
    const full = match[0];
    const tagName = match[1];
    if (full.startsWith('</')) {
      const previous = stack.pop();
      if (!previous || previous.tagName !== tagName) {
        diagnostics.push({ level: 'error', code: 'ARI_MISMATCHED_CLOSE_TAG', message: `Unexpected close tag: ${tagName}.`, index: match.index });
      }
      continue;
    }
    if (!full.endsWith('/>')) stack.push({ tagName, index: match.index });
  }

  const unclosed = stack.pop();
  if (unclosed) {
    diagnostics.push({ level: 'error', code: 'ARI_MISSING_CLOSE_TAG', message: `Element <${unclosed.tagName}> is missing a matching close tag.`, index: unclosed.index });
  }
}

function collectControlBlockDiagnostics(template: string, diagnostics: ArianaTemplateDiagnostic[]) {
  collectOneControlBlock(template, '@if', 'ARI_INVALID_IF', diagnostics);
  collectOneControlBlock(template, '@for', 'ARI_INVALID_FOR', diagnostics);
}

function collectOneControlBlock(template: string, keyword: '@if' | '@for', code: string, diagnostics: ArianaTemplateDiagnostic[]) {
  let index = 0;
  while (index < template.length) {
    const start = template.indexOf(keyword, index);
    if (start < 0) return;
    const expressionStart = template.indexOf('(', start);
    const expressionEnd = expressionStart >= 0 ? findMatching(template, expressionStart, '(', ')') : -1;
    const bodyStart = expressionEnd >= 0 ? template.indexOf('{', expressionEnd) : -1;
    const bodyEnd = bodyStart >= 0 ? findMatching(template, bodyStart, '{', '}') : -1;

    if (expressionStart < 0 || expressionEnd < 0 || bodyStart < 0 || bodyEnd < 0) {
      diagnostics.push({ level: 'error', code, message: `${keyword} block is incomplete.`, index: start });
      return;
    }

    index = bodyEnd + 1;
  }
}

function findMatching(source: string, start: number, open: string, close: string): number {
  let depth = 0;
  let quote: string | undefined;

  for (let index = start; index < source.length; index++) {
    const char = source[index];
    const previous = source[index - 1];

    if (quote) {
      if (char === quote && previous !== '\\') quote = undefined;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === open) depth++;
    if (char === close) depth--;
    if (depth === 0) return index;
  }

  return -1;
}
