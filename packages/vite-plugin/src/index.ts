import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

type VitePlugin = {
  name: string;
  enforce?: 'pre' | 'post';
  transform?: (code: string, id: string) => string | null | Promise<string | null>;
};

export type ArianaVitePluginOptions = {
  include?: RegExp;
  compileTemplates?: boolean;
};

type ResourceTransformResult = {
  code: string;
  usedCompiler: boolean;
};

type CompileResult =
  | { renderCode: string; reason?: never }
  | { renderCode?: never; reason: string };

export function ariana(options: ArianaVitePluginOptions = {}): VitePlugin {
  const include = options.include ?? /\.(ts|tsx)$/;
  const compileTemplates = options.compileTemplates ?? true;

  return {
    name: 'ariana-framework-template-url',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!include.test(id) || !code.includes('@Component')) {
        return null;
      }

      const result = transformComponentResources(code, id, compileTemplates);
      return result.code === code ? null : result.code;
    }
  };
}

export default ariana;

function transformComponentResources(code: string, id: string, compileTemplates: boolean): ResourceTransformResult {
  const directory = dirname(id);
  let importIndex = 0;
  const imports: string[] = [];
  let usedCompiler = false;

  let transformed = code.replace(/@Component\s*\(\s*\{([\s\S]*?)\}\s*\)/g, (_fullMatch, body: string) => {
    const templateUrl = findStringProperty(body, 'templateUrl');
    const styleUrl = findStringProperty(body, 'styleUrl');
    let nextBody = body;

    if (styleUrl) {
      const style = readTextResource(directory, styleUrl);
      nextBody = replaceStringProperty(nextBody, 'styleUrl', `style: ${JSON.stringify(style)}`);
    }

    if (templateUrl) {
      const template = readTextResource(directory, templateUrl);
      const compiled = compileTemplates
        ? compileTemplateToRender(template)
        : { reason: 'compiler disabled' };

      if ('renderCode' in compiled) {
        nextBody = replaceStringProperty(nextBody, 'templateUrl', `render: ${compiled.renderCode}`);
        usedCompiler = true;
      } else {
        const name = `__ari_template_${importIndex++}`;
        imports.push(`import ${name} from ${JSON.stringify(`${templateUrl}?raw`)};`);
        nextBody = replaceStringProperty(nextBody, 'templateUrl', `template: ${name}`);
      }
    }

    return `@Component({${nextBody}})`;
  });

  if (usedCompiler && !code.includes('effect as __ari_effect')) {
    imports.unshift(`import { effect as __ari_effect } from '@ariana/core';`);
  }

  if (imports.length > 0) {
    transformed = `${imports.join('\n')}\n${transformed}`;
  }

  return { code: transformed, usedCompiler };
}

function findStringProperty(source: string, propertyName: string): string | undefined {
  const match = source.match(new RegExp(`${propertyName}\\s*:\\s*(['\"])(.*?)\\1`));
  return match?.[2];
}

function replaceStringProperty(source: string, propertyName: string, replacement: string): string {
  return source.replace(new RegExp(`${propertyName}\\s*:\\s*(['\"])(.*?)\\1`), replacement);
}

function readTextResource(directory: string, resourcePath: string): string {
  return readFileSync(resolve(directory, resourcePath), 'utf8');
}

function compileTemplateToRender(template: string): CompileResult {
  if (template.includes('@for')) {
    return { reason: 'for control flow is not compiled in this preview' };
  }

  const idState = { ifId: 0 };
  const segment = compileTemplateSegment(template, idState);
  const lines: string[] = [];

  lines.push(`function __ari_render(ctx, host) {`);
  lines.push(`  host.innerHTML = ${JSON.stringify(segment.html)};`);
  lines.push(`  const cleanups = [];`);
  appendBindingLines(lines, segment, 'host', 'ctx', 'cleanups', 'root');
  lines.push(`  return () => { for (const cleanup of cleanups.splice(0)) cleanup(); };`);
  lines.push(`}`);

  return { renderCode: lines.join('\n') };
}

type CompiledTemplateSegment = {
  html: string;
  textBindings: string[];
  propBindings: Array<{ marker: string; propertyName: string; expression: string }>;
  classBindings: Array<{ marker: string; className: string; expression: string }>;
  eventBindings: Array<{ marker: string; eventName: string; statement: string }>;
  ifBlocks: Array<{ anchorId: number; expression: string; segment: CompiledTemplateSegment }>;
};

function compileTemplateSegment(template: string, idState: { ifId: number }): CompiledTemplateSegment {
  const ifBlocks: CompiledTemplateSegment['ifBlocks'] = [];
  let html = transformIfBlocks(template, idState, ifBlocks);

  const textBindings: string[] = [];
  const propBindings: Array<{ marker: string; propertyName: string; expression: string }> = [];
  const classBindings: Array<{ marker: string; className: string; expression: string }> = [];
  const eventBindings: Array<{ marker: string; eventName: string; statement: string }> = [];

  html = html.replace(/\{\{\s*(.*?)\s*\}\}/g, (_match, expression: string) => {
    const index = textBindings.push(expression.trim()) - 1;
    return `<span data-ari-text="${index}"></span>`;
  });

  html = html.replace(/\s\[class\.([\w-]+)\]="(.*?)"/g, (_match, className: string, expression: string) => {
    const marker = `data-ari-class-${classBindings.length}`;
    classBindings.push({ marker, className, expression });
    return ` ${marker}=""`;
  });

  html = html.replace(/\s\[([\w-]+)\]="(.*?)"/g, (_match, propertyName: string, expression: string) => {
    const marker = `data-ari-prop-${propBindings.length}`;
    propBindings.push({ marker, propertyName, expression });
    return ` ${marker}=""`;
  });

  html = html.replace(/\s\(([\w-]+)\)="(.*?)"/g, (_match, eventName: string, statement: string) => {
    const marker = `data-ari-event-${eventBindings.length}`;
    eventBindings.push({ marker, eventName, statement });
    return ` ${marker}=""`;
  });

  return { html, textBindings, propBindings, classBindings, eventBindings, ifBlocks };
}

function transformIfBlocks(source: string, idState: { ifId: number }, ifBlocks: CompiledTemplateSegment['ifBlocks']): string {
  let index = 0;
  let output = '';

  while (index < source.length) {
    const markerIndex = source.indexOf('@if', index);

    if (markerIndex === -1) {
      output += source.slice(index);
      break;
    }

    output += source.slice(index, markerIndex);

    let cursor = markerIndex + 3;
    while (source[cursor] && /\s/.test(source[cursor])) cursor++;

    if (source[cursor] !== '(') {
      output += '@if';
      index = cursor;
      continue;
    }

    const expressionEnd = findMatching(source, cursor, '(', ')');
    const expression = source.slice(cursor + 1, expressionEnd).trim();

    cursor = expressionEnd + 1;
    while (source[cursor] && /\s/.test(source[cursor])) cursor++;

    if (source[cursor] !== '{') {
      return source;
    }

    const blockEnd = findMatching(source, cursor, '{', '}');
    const content = source.slice(cursor + 1, blockEnd);
    const anchorId = idState.ifId++;
    const segment = compileTemplateSegment(content, idState);

    ifBlocks.push({ anchorId, expression, segment });
    output += `<span data-ari-if-anchor="${anchorId}"></span>`;
    index = blockEnd + 1;
  }

  return output;
}

function appendBindingLines(lines: string[], segment: CompiledTemplateSegment, rootVar: string, ctxVar: string, cleanupsVar: string, prefix: string) {
  segment.textBindings.forEach((expression, index) => {
    const variable = `${prefix}_text_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[data-ari-text="${index}"]');`);
    lines.push(`  if (${variable}) ${cleanupsVar}.push(__ari_effect(() => { ${variable}.textContent = String((${compileExpression(expression, ctxVar)}) ?? ''); }));`);
  });

  segment.classBindings.forEach((binding, index) => {
    const variable = `${prefix}_class_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[${binding.marker}]');`);
    lines.push(`  if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); ${cleanupsVar}.push(__ari_effect(() => { ${variable}.classList.toggle(${JSON.stringify(binding.className)}, Boolean(${compileExpression(binding.expression, ctxVar)})); })); }`);
  });

  segment.propBindings.forEach((binding, index) => {
    const variable = `${prefix}_prop_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[${binding.marker}]');`);
    lines.push(`  if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); ${cleanupsVar}.push(__ari_effect(() => { const value = ${compileExpression(binding.expression, ctxVar)}; if (${JSON.stringify(binding.propertyName)} in ${variable}) ${variable}[${JSON.stringify(binding.propertyName)}] = value; else if (value == null || value === false) ${variable}.removeAttribute(${JSON.stringify(binding.propertyName)}); else ${variable}.setAttribute(${JSON.stringify(binding.propertyName)}, String(value)); })); }`);
  });

  segment.eventBindings.forEach((binding, index) => {
    const variable = `${prefix}_event_${index}`;
    const listener = `${prefix}_listener_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[${binding.marker}]');`);
    lines.push(`  if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); const ${listener} = ($event) => { ${compileStatement(binding.statement, ctxVar)}; }; ${variable}.addEventListener(${JSON.stringify(binding.eventName)}, ${listener}); ${cleanupsVar}.push(() => ${variable}.removeEventListener(${JSON.stringify(binding.eventName)}, ${listener})); }`);
  });

  segment.ifBlocks.forEach((block, index) => {
    const anchor = `${prefix}_if_anchor_${index}`;
    const mountedNodes = `${prefix}_if_nodes_${index}`;
    const childCleanups = `${prefix}_if_cleanups_${index}`;
    const template = `${prefix}_if_template_${index}`;
    const fragment = `${prefix}_if_fragment_${index}`;
    const nodes = `${prefix}_if_new_nodes_${index}`;
    const nestedPrefix = `${prefix}_if_${index}`;

    lines.push(`  const ${anchor} = ${rootVar}.querySelector('[data-ari-if-anchor="${block.anchorId}"]');`);
    lines.push(`  let ${mountedNodes} = [];`);
    lines.push(`  let ${childCleanups} = [];`);
    lines.push(`  if (${anchor}) { ${anchor}.removeAttribute('data-ari-if-anchor'); ${cleanupsVar}.push(__ari_effect(() => {`);
    lines.push(`    for (const cleanup of ${childCleanups}.splice(0)) cleanup();`);
    lines.push(`    for (const node of ${mountedNodes}.splice(0)) node.parentNode?.removeChild(node);`);
    lines.push(`    if (Boolean(${compileExpression(block.expression, ctxVar)})) {`);
    lines.push(`      const ${template} = document.createElement('template');`);
    lines.push(`      ${template}.innerHTML = ${JSON.stringify(block.segment.html)};`);
    lines.push(`      const ${fragment} = ${template}.content.cloneNode(true);`);
    lines.push(`      const ${nodes} = Array.from(${fragment}.childNodes);`);
    appendBindingLines(lines, block.segment, fragment, ctxVar, childCleanups, nestedPrefix);
    lines.push(`      ${anchor}.after(${fragment});`);
    lines.push(`      ${mountedNodes} = ${nodes};`);
    lines.push(`    }`);
    lines.push(`  })); }`);
  });
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

function compileExpression(expression: string, contextName = 'ctx'): string {
  return expression.replace(/(?<![\w.$])([A-Za-z_$][\w$]*)\s*\(/g, (match, name: string) => {
    if (isGlobalFunction(name)) return match;
    return `${contextName}.${name}(`;
  });
}

function compileStatement(statement: string, contextName = 'ctx'): string {
  return compileExpression(statement, contextName);
}

function isGlobalFunction(name: string): boolean {
  return new Set(['Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'Math', 'parseInt', 'parseFloat', 'isNaN', 'isFinite']).has(name);
}
