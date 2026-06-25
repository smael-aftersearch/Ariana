const encode = (value: string) => value.replace(/"/g, '&quot;');

export function transformControlFlow(template: string): string {
  return transformFor(transformIf(template));
}

function transformIf(template: string): string {
  return transformBlock(template, '@if', (expression, content) => {
    return `<template data-ari-if="${encode(expression)}">${content}</template>`;
  });
}

function transformFor(template: string): string {
  return transformBlock(template, '@for', (expression, content) => {
    const match = expression.match(/^\s*([A-Za-z_$][\w$]*)\s+of\s+(.+?)(?:;\s*track\s+(.+))?\s*$/);

    if (!match) {
      throw new Error(`Invalid Ariana @for expression: ${expression}`);
    }

    const [, itemName, iterable, track] = match;

    return `<template data-ari-for-item="${encode(itemName)}" data-ari-for-of="${encode(iterable)}" data-ari-for-track="${encode(track ?? '')}">${content}</template>`;
  });
}

function transformBlock(source: string, marker: '@if' | '@for', create: (expression: string, content: string) => string): string {
  let index = 0;
  let output = '';

  while (index < source.length) {
    const markerIndex = source.indexOf(marker, index);

    if (markerIndex === -1) {
      output += source.slice(index);
      break;
    }

    output += source.slice(index, markerIndex);

    let cursor = markerIndex + marker.length;
    while (source[cursor] && /\s/.test(source[cursor])) cursor++;

    if (source[cursor] !== '(') {
      output += marker;
      index = cursor;
      continue;
    }

    const expressionEnd = findMatching(source, cursor, '(', ')');
    const expression = source.slice(cursor + 1, expressionEnd).trim();

    cursor = expressionEnd + 1;
    while (source[cursor] && /\s/.test(source[cursor])) cursor++;

    if (source[cursor] !== '{') {
      throw new Error(`Ariana ${marker} block is invalid.`);
    }

    const blockEnd = findMatching(source, cursor, '{', '}');
    const content = source.slice(cursor + 1, blockEnd);

    output += create(expression, content);
    index = blockEnd + 1;
  }

  return output;
}

function findMatching(source: string, start: number, open: string, close: string): number {
  let depth = 0;
  let quote: string | null = null;

  for (let i = start; i < source.length; i++) {
    const char = source[i];
    const previous = source[i - 1];

    if (quote) {
      if (char === quote && previous !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === open) depth++;
    if (char === close) depth--;

    if (depth === 0) {
      return i;
    }
  }

  throw new Error(`Ariana template parser could not find matching ${close}.`);
}
