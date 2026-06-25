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
  if (template.includes('@if') || template.includes('@for')) {
    return { reason: 'control flow is not compiled in this preview' };
  }

  const textBindings: string[] = [];
  const propBindings: Array<{ marker: string; propertyName: string; expression: string }> = [];
  const classBindings: Array<{ marker: string; className: string; expression: string }> = [];
  const eventBindings: Array<{ marker: string; eventName: string; statement: string }> = [];

  let html = template;

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

  const lines: string[] = [];
  lines.push(`function __ari_render(ctx, host) {`);
  lines.push(`  host.innerHTML = ${JSON.stringify(html)};`);
  lines.push(`  const cleanups = [];`);

  textBindings.forEach((expression, index) => {
    lines.push(`  const text_${index} = host.querySelector('[data-ari-text="${index}"]');`);
    lines.push(`  if (text_${index}) cleanups.push(__ari_effect(() => { text_${index}.textContent = String((${compileExpression(expression)}) ?? ''); }));`);
  });

  classBindings.forEach((binding, index) => {
    lines.push(`  const class_${index} = host.querySelector('[${binding.marker}]');`);
    lines.push(`  if (class_${index}) { class_${index}.removeAttribute('${binding.marker}'); cleanups.push(__ari_effect(() => { class_${index}.classList.toggle(${JSON.stringify(binding.className)}, Boolean(${compileExpression(binding.expression)})); })); }`);
  });

  propBindings.forEach((binding, index) => {
    lines.push(`  const prop_${index} = host.querySelector('[${binding.marker}]');`);
    lines.push(`  if (prop_${index}) { prop_${index}.removeAttribute('${binding.marker}'); cleanups.push(__ari_effect(() => { const value = ${compileExpression(binding.expression)}; if (${JSON.stringify(binding.propertyName)} in prop_${index}) prop_${index}[${JSON.stringify(binding.propertyName)}] = value; else if (value == null || value === false) prop_${index}.removeAttribute(${JSON.stringify(binding.propertyName)}); else prop_${index}.setAttribute(${JSON.stringify(binding.propertyName)}, String(value)); })); }`);
  });

  eventBindings.forEach((binding, index) => {
    lines.push(`  const event_${index} = host.querySelector('[${binding.marker}]');`);
    lines.push(`  if (event_${index}) { event_${index}.removeAttribute('${binding.marker}'); const listener_${index} = ($event) => { ${compileStatement(binding.statement)}; }; event_${index}.addEventListener(${JSON.stringify(binding.eventName)}, listener_${index}); cleanups.push(() => event_${index}.removeEventListener(${JSON.stringify(binding.eventName)}, listener_${index})); }`);
  });

  lines.push(`  return () => { for (const cleanup of cleanups.splice(0)) cleanup(); };`);
  lines.push(`}`);

  return { renderCode: lines.join('\n') };
}

function compileExpression(expression: string): string {
  return expression.replace(/(?<![\w.$])([A-Za-z_$][\w$]*)\s*\(/g, (match, name: string) => {
    if (isGlobalFunction(name)) return match;
    return `ctx.${name}(`;
  });
}

function compileStatement(statement: string): string {
  return compileExpression(statement);
}

function isGlobalFunction(name: string): boolean {
  return new Set([
    'Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'Math', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'
  ]).has(name);
}
