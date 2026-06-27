import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { parseTemplateToAst } from './compiler-diagnostics.js';
import { compileTemplateToRender } from './compiler.js';
import { formatTemplateDiagnostic } from '@ariana/compiler/diagnostics';
import { inferComponentContextMembers, mergeTypeCheckMembers, typeCheckTemplate } from '@ariana/compiler/typecheck';


type VitePlugin = {
  name: string;
  enforce?: 'pre' | 'post';
  transform?: (code: string, id: string) => string | null | Promise<string | null>;
};

export type ArianaVitePluginOptions = {
  include?: RegExp;
  compileTemplates?: boolean;
  strictTemplates?: boolean;
  typeCheckTemplates?: boolean;
  templateTypeCheckMembers?: readonly string[];
};

type ResourceTransformResult = {
  code: string;
  usedCompiler: boolean;
};

export function ariana(options: ArianaVitePluginOptions = {}): VitePlugin {
  const include = options.include ?? /\.(ts|tsx)$/;
  const compileTemplates = options.compileTemplates ?? true;
  const strictTemplates = options.strictTemplates ?? true;
  const typeCheckTemplates = options.typeCheckTemplates ?? false;
  const explicitTypeCheckMembers = options.templateTypeCheckMembers ?? [];

  return {
    name: 'ariana-framework-template-url',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!include.test(id) || !code.includes('Component')) {
        return null;
      }

      const inferredMembers = inferComponentContextMembers(code).members;
      const templateTypeCheckMembers = mergeTypeCheckMembers(explicitTypeCheckMembers, inferredMembers);
      const result = transformComponentResources(code, id, compileTemplates, strictTemplates, typeCheckTemplates, templateTypeCheckMembers);
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
  typeCheckTemplates: boolean,
  templateTypeCheckMembers: readonly string[]
): ResourceTransformResult {
  const directory = dirname(id);
  let importIndex = 0;
  const imports: string[] = [];
  let usedCompiler = false;

  let transformed = code.replace(/(@?)Component\s*\(\s*\{([\s\S]*?)\}\s*\)/g, (_fullMatch, decoratorPrefix: string, body: string) => {
    const templateUrl = findStringProperty(body, 'templateUrl');
    const styleUrl = findStringProperty(body, 'styleUrl');
    let nextBody = body;

    if (styleUrl) {
      const style = readTextResource(directory, styleUrl);
      nextBody = replaceStringProperty(nextBody, 'styleUrl', `style: ${JSON.stringify(style)}`);
    }

    if (templateUrl) {
      const template = readTextResource(directory, templateUrl);
      const diagnostics = parseTemplateToAst(template).diagnostics;
      const blockingDiagnostic = diagnostics.find(diagnostic => diagnostic.level === 'error');

      if (typeCheckTemplates && strictTemplates) {
        const typeCheck = typeCheckTemplate(template, { members: templateTypeCheckMembers });
        const typeError = typeCheck.diagnostics.find(diagnostic => diagnostic.level === 'error');
        if (typeError) {
          throw new Error(`Ariana template typecheck error\n${formatTemplateDiagnostic(template, typeError, { fileName: templateUrl, includeSourceLine: true })}`);
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
    }

    return `${decoratorPrefix}Component({${nextBody}})`;
  });

  if (usedCompiler && !code.includes('effect as __ari_effect')) {
    imports.unshift(`import { effect as __ari_effect, signal as __ari_signal } from '@ariana/core';`);
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
