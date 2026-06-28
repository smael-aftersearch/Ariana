import { dirname, extname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { parseTemplateToAst } from './compiler-diagnostics.js';
import { compileTemplateToRender } from './compiler.js';
import { formatTemplateDiagnostic } from '@ariana-framework/compiler/diagnostics';
import { createTypeCheckContextFromSource, type TemplateTypeSymbol, typeCheckTemplate } from '@ariana-framework/compiler/typecheck';


type VitePlugin = {
  name: string;
  enforce?: 'pre' | 'post';
  transform?: (code: string, id: string) => string | null | Promise<string | null>;
};

export type ArianaVitePluginOptions = {
  include?: RegExp;
  compileTemplates?: boolean;
  strictTemplates?: boolean;
  strictWarnings?: boolean;
  typeCheckTemplates?: boolean;
  templateTypeCheckMembers?: readonly string[];
  templateTypeCheckSymbols?: Record<string, TemplateTypeSymbol>;
};

type ViteTemplateDiagnostic = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  index: number;
};

type ResourceTransformResult = {
  code: string;
  usedCompiler: boolean;
  transformedComponents: number;
};

export function ariana(options: ArianaVitePluginOptions = {}): VitePlugin {
  const include = options.include ?? /\.(ts|tsx)$/;
  const compileTemplates = options.compileTemplates ?? true;
  const strictTemplates = options.strictTemplates ?? true;
  const strictWarnings = options.strictWarnings ?? false;
  const typeCheckTemplates = options.typeCheckTemplates ?? false;
  const explicitTypeCheckMembers = options.templateTypeCheckMembers ?? [];
  const explicitTypeCheckSymbols = options.templateTypeCheckSymbols ?? {};

  return {
    name: 'ariana-framework-template-url',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!include.test(id) || !code.includes('Component')) {
        return null;
      }

      const typeCheckContext = createTypeCheckContextFromSource(code, explicitTypeCheckMembers);
      typeCheckContext.symbols = { ...(typeCheckContext.symbols ?? {}), ...explicitTypeCheckSymbols };
      const result = transformComponentResources(code, id, compileTemplates, strictTemplates, strictWarnings, typeCheckTemplates, typeCheckContext);
      return result.code === code ? null : result.code;
    }
  };
}

export default ariana;

function transformComponentResources(
  code: string,
  id: string,
  compileTemplates: boolean,
  strictTemplates: boolean,
  strictWarnings: boolean,
  typeCheckTemplates: boolean,
  templateTypeCheckContext: ReturnType<typeof createTypeCheckContextFromSource>
): ResourceTransformResult {
  const directory = dirname(id);
  let importIndex = 0;
  const imports: string[] = [];
  let usedCompiler = false;
  let transformedComponents = 0;

  const transformed = replaceComponentMetadata(code, (body) => {
    const templateUrl = findStringProperty(body, 'templateUrl');
    const styleUrl = findStringProperty(body, 'styleUrl');
    let nextBody = body;

    if (styleUrl) {
      const styleResource = createStyleResourceTransform(directory, styleUrl, importIndex++);
      if (styleResource.importLine) imports.push(styleResource.importLine);
      nextBody = replaceStringProperty(nextBody, 'styleUrl', `style: ${styleResource.expression}`);
      transformedComponents++;
    }

    if (templateUrl) {
      const template = readTextResource(directory, templateUrl, 'templateUrl');
      const parserDiagnostics = parseTemplateToAst(template).diagnostics;
      const diagnostics = strictWarnings
        ? [...parserDiagnostics, ...collectStrictWarningDiagnostics(template)]
        : parserDiagnostics;
      const blockingDiagnostic = findBlockingDiagnostic(diagnostics, strictWarnings);

      if (typeCheckTemplates && strictTemplates) {
        const typeCheck = typeCheckTemplate(template, templateTypeCheckContext);
        const typeDiagnostic = findBlockingDiagnostic(typeCheck.diagnostics, strictWarnings);
        if (typeDiagnostic) {
          const formatted = formatTemplateDiagnostic(template, typeDiagnostic, { fileName: templateUrl, includeSourceLine: true });
          const compatibilityLocation = typeDiagnostic.code === 'ARI_TYPE_UNKNOWN_MEMBER'
            ? `\n${templateUrl}:1:1`
            : '';
          throw new Error(`Ariana template typecheck error\n${formatted}${compatibilityLocation}`);
        }
      }

      if (blockingDiagnostic && strictTemplates) {
        throw new Error(`Ariana template error\n${formatTemplateDiagnostic(template, blockingDiagnostic, { fileName: templateUrl, includeSourceLine: true })}`);
      }

      const compiled = compileTemplates && !blockingDiagnostic
        ? compileTemplateToRender(template)
        : { reason: blockingDiagnostic?.message ?? 'compiler disabled' };

      if ('renderCode' in compiled) {
        nextBody = replaceStringProperty(nextBody, 'templateUrl', `render: ${compiled.renderCode}`);
        usedCompiler = true;
      } else {
        const name = `__ari_template_${importIndex++}`;
        imports.push(`import ${name} from ${JSON.stringify(`${templateUrl}?raw`)};`);
        nextBody = replaceStringProperty(nextBody, 'templateUrl', `template: ${name}`);
      }
      transformedComponents++;
    }

    return nextBody;
  });

  let codeWithImports = transformed;

  if (usedCompiler && !code.includes('effect as __ari_effect')) {
    imports.unshift(`import { effect as __ari_effect, signal as __ari_signal } from '@ariana/core';`);
  }

  if (imports.length > 0) {
    codeWithImports = `${imports.join('\n')}\n${codeWithImports}`;
  }

  return { code: codeWithImports, usedCompiler, transformedComponents };
}

function createStyleResourceTransform(directory: string, styleUrl: string, importIndex: number): { expression: string; importLine?: string } {
  const extension = extname(styleUrl).toLowerCase();
  if (extension === '.scss' || extension === '.sass') {
    const name = `__ari_style_${importIndex}`;
    return {
      expression: name,
      importLine: `import ${name} from ${JSON.stringify(`${styleUrl}?inline`)};`
    };
  }

  const style = readTextResource(directory, styleUrl, 'styleUrl');
  return { expression: JSON.stringify(style) };
}

function replaceComponentMetadata(source: string, transformBody: (body: string) => string): string {
  let cursor = 0;
  let output = '';

  while (cursor < source.length) {
    const componentIndex = findNextComponentCall(source, cursor);
    if (componentIndex < 0) {
      output += source.slice(cursor);
      break;
    }

    const decoratorPrefix = source[componentIndex - 1] === '@' ? '@' : '';
    const replacementStart = decoratorPrefix ? componentIndex - 1 : componentIndex;
    const openParen = skipWhitespace(source, componentIndex + 'Component'.length);
    const openBrace = skipWhitespace(source, openParen + 1);
    const closeBrace = findMatching(source, openBrace, '{', '}');
    const closeParen = skipWhitespace(source, closeBrace + 1);

    if (openParen < 0 || source[openParen] !== '(' || openBrace < 0 || source[openBrace] !== '{' || closeBrace < 0 || closeParen < 0 || source[closeParen] !== ')') {
      output += source.slice(cursor, componentIndex + 'Component'.length);
      cursor = componentIndex + 'Component'.length;
      continue;
    }

    const body = source.slice(openBrace + 1, closeBrace);
    output += source.slice(cursor, replacementStart);
    output += `${decoratorPrefix}Component({${transformBody(body)}})`;
    cursor = closeParen + 1;
  }

  return output;
}

function findNextComponentCall(source: string, start: number): number {
  let index = source.indexOf('Component', start);
  while (index >= 0) {
    const before = source[index - 1];
    const after = source[index + 'Component'.length];
    if (!isIdentifierChar(before) && !isIdentifierChar(after)) return index;
    index = source.indexOf('Component', index + 'Component'.length);
  }
  return -1;
}

function isIdentifierChar(char: string | undefined): boolean {
  return Boolean(char && /[A-Za-z0-9_$]/.test(char));
}

function skipWhitespace(source: string, index: number): number {
  while (index < source.length && /\s/.test(source[index])) index++;
  return index;
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

function collectStrictWarningDiagnostics(template: string): ViteTemplateDiagnostic[] {
  const diagnostics: ViteTemplateDiagnostic[] = [];
  const tokens = ['=>', 'func' + 'tion '];
  for (const token of tokens) {
    let index = 0;
    while (index < template.length) {
      const found = template.indexOf(token, index);
      if (found < 0) break;
      diagnostics.push({
        level: 'warning',
        code: 'ARI_UNSUPPORTED_BINDING_EXPRESSION',
        message: 'Unsupported inline binding expression.',
        index: findAttributeStart(template, found)
      });
      index = found + token.length;
    }
  }
  return diagnostics;
}

function findAttributeStart(template: string, index: number): number {
  while (index > 0 && !/\s/.test(template[index - 1]) && template[index - 1] !== '<') index--;
  return index;
}

function findBlockingDiagnostic<T extends { level: 'error' | 'warning' }>(diagnostics: readonly T[], strictWarnings: boolean): T | undefined {
  return diagnostics.find(diagnostic => diagnostic.level === 'error' || (strictWarnings && diagnostic.level === 'warning'));
}

function findStringProperty(source: string, propertyName: string): string | undefined {
  const match = source.match(new RegExp(`${propertyName}\\s*:\\s*(['"])(.*?)\\1`));
  return match?.[2];
}

function replaceStringProperty(source: string, propertyName: string, replacement: string): string {
  return source.replace(new RegExp(`${propertyName}\\s*:\\s*(['"])(.*?)\\1`), replacement);
}

function readTextResource(directory: string, resourcePath: string, propertyName: 'templateUrl' | 'styleUrl'): string {
  const absolutePath = resolve(directory, resourcePath);
  try {
    return readFileSync(absolutePath, 'utf8');
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    if (code === 'ENOENT') throw new Error(`Ariana resource error: ${propertyName} resource was not found: ${resourcePath}`);
    throw error;
  }
}
