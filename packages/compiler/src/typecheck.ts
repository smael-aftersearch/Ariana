import { createTemplateDiagnostic, parseTemplateToAst } from './index.js';
import type { ArianaTemplateAstNode, ArianaTemplateDiagnostic } from './index.js';

export type TemplateTypeSymbolKind = 'value' | 'method' | 'object' | 'array';

export type TemplateTypeSymbol = {
  kind: TemplateTypeSymbolKind;
  properties?: Record<string, TemplateTypeSymbol>;
  minArgs?: number;
  maxArgs?: number;
};

export type TemplateTypeCheckContext = {
  members: readonly string[];
  symbols?: Record<string, TemplateTypeSymbol>;
};

export type TemplateTypeCheckResult = {
  diagnostics: ArianaTemplateDiagnostic[];
};

export type ComponentContextInferenceResult = {
  members: string[];
};

type TypeCheckScope = {
  members: Set<string>;
  symbols: Map<string, TemplateTypeSymbol>;
};

const TEMPLATE_GLOBALS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'Math',
  'Number',
  'String',
  'Boolean',
  'Array',
  'Date',
  'JSON'
]);

const CONTROL_WORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'function']);

export function typeCheckTemplate(template: string, context: TemplateTypeCheckContext): TemplateTypeCheckResult {
  const result = parseTemplateToAst(template);
  const diagnostics = [...result.diagnostics];
  const scope = createScope(context.members, context.symbols ?? {});

  for (const node of result.ast.children) checkNode(template, node, scope, diagnostics);

  return { diagnostics };
}

export function inferComponentContextMembers(source: string): ComponentContextInferenceResult {
  const classBodies = extractClassBodies(source);
  const members = new Set<string>();

  for (const classBody of classBodies) {
    collectClassFields(classBody, members);
    collectClassMethods(classBody, members);
    collectAccessors(classBody, members);
  }

  return { members: [...members] };
}

export function mergeTypeCheckMembers(...groups: readonly (readonly string[])[]): string[] {
  return [...new Set(groups.flat())];
}

function checkNode(template: string, node: ArianaTemplateAstNode, scope: TypeCheckScope, diagnostics: ArianaTemplateDiagnostic[]) {
  if (node.kind === 'Interpolation') checkExpression(template, node.expression, node.span.start, scope, diagnostics);
  if (node.kind === 'IfBlock') {
    checkExpression(template, node.expression, node.span.start, scope, diagnostics);
    for (const child of node.children) checkNode(template, child, scope, diagnostics);
  }
  if (node.kind === 'ForBlock') {
    checkExpression(template, node.iterableExpression, node.span.start, scope, diagnostics);
    const scoped = extendScope(scope, [node.itemName, '$index']);
    if (node.trackExpression) checkExpression(template, node.trackExpression, node.span.start, scoped, diagnostics);
    for (const child of node.children) checkNode(template, child, scoped, diagnostics);
  }
  if (node.kind === 'Element') {
    for (const attribute of node.attributes) {
      if (attribute.binding === 'static') continue;
      const scoped = attribute.binding === 'event'
        ? extendScope(scope, ['$event'])
        : scope;
      checkExpression(template, attribute.value, attribute.span.start, scoped, diagnostics);
    }
    for (const child of node.children) checkNode(template, child, scope, diagnostics);
  }
}

function checkExpression(template: string, expression: string, index: number, scope: TypeCheckScope, diagnostics: ArianaTemplateDiagnostic[]) {
  checkRootIdentifiers(template, expression, index, scope, diagnostics);
  checkPropertyAccess(template, expression, index, scope, diagnostics);
  checkCallExpressions(template, expression, index, scope, diagnostics);
}

function checkRootIdentifiers(template: string, expression: string, index: number, scope: TypeCheckScope, diagnostics: ArianaTemplateDiagnostic[]) {
  const identifiers = extractRootIdentifiers(expression);
  for (const identifier of identifiers) {
    if (TEMPLATE_GLOBALS.has(identifier) || CONTROL_WORDS.has(identifier)) continue;
    if (!scope.members.has(identifier)) {
      diagnostics.push(createTemplateDiagnostic(
        template,
        'error',
        'ARI_TYPE_UNKNOWN_MEMBER',
        `Unknown template member: ${identifier}`,
        index
      ));
    }
  }
}

function checkPropertyAccess(template: string, expression: string, index: number, scope: TypeCheckScope, diagnostics: ArianaTemplateDiagnostic[]) {
  const propertyPattern = /\b([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;

  while ((match = propertyPattern.exec(stripStrings(expression)))) {
    const root = match[1];
    const property = match[2];
    if (TEMPLATE_GLOBALS.has(root)) continue;
    const symbol = scope.symbols.get(root);
    if (!symbol?.properties) continue;
    if (!symbol.properties[property]) {
      diagnostics.push(createTemplateDiagnostic(
        template,
        'error',
        'ARI_TYPE_UNKNOWN_PROPERTY',
        `Unknown template property: ${root}.${property}`,
        index
      ));
    }
  }
}

function checkCallExpressions(template: string, expression: string, index: number, scope: TypeCheckScope, diagnostics: ArianaTemplateDiagnostic[]) {
  const callPattern = /\b([A-Za-z_$][\w$]*)\s*\(([^()]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = callPattern.exec(stripStrings(expression)))) {
    const name = match[1];
    if (TEMPLATE_GLOBALS.has(name) || CONTROL_WORDS.has(name)) continue;
    const symbol = scope.symbols.get(name);
    if (!symbol) continue;
    if (symbol.kind !== 'method') {
      diagnostics.push(createTemplateDiagnostic(
        template,
        'error',
        'ARI_TYPE_CALL_NON_METHOD',
        `Template member is not callable: ${name}`,
        index
      ));
      continue;
    }

    const argCount = countArguments(match[2]);
    if (typeof symbol.minArgs === 'number' && argCount < symbol.minArgs) {
      diagnostics.push(createTemplateDiagnostic(
        template,
        'error',
        'ARI_TYPE_METHOD_ARGUMENT_COUNT',
        `Template method ${name} expects at least ${symbol.minArgs} argument(s), got ${argCount}.`,
        index
      ));
    }
    if (typeof symbol.maxArgs === 'number' && argCount > symbol.maxArgs) {
      diagnostics.push(createTemplateDiagnostic(
        template,
        'error',
        'ARI_TYPE_METHOD_ARGUMENT_COUNT',
        `Template method ${name} expects at most ${symbol.maxArgs} argument(s), got ${argCount}.`,
        index
      ));
    }
  }
}

function createScope(members: readonly string[], symbols: Record<string, TemplateTypeSymbol>): TypeCheckScope {
  const memberSet = new Set(members);
  const symbolMap = new Map<string, TemplateTypeSymbol>();
  for (const [name, symbol] of Object.entries(symbols)) {
    memberSet.add(name);
    symbolMap.set(name, symbol);
  }
  return { members: memberSet, symbols: symbolMap };
}

function extendScope(scope: TypeCheckScope, names: readonly string[]): TypeCheckScope {
  const members = new Set(scope.members);
  const symbols = new Map(scope.symbols);
  for (const name of names) {
    members.add(name);
    if (!symbols.has(name)) symbols.set(name, { kind: 'value' });
  }
  return { members, symbols };
}

function extractRootIdentifiers(expression: string): string[] {
  const identifiers = new Set<string>();
  const sanitized = stripStrings(expression).replace(/\b(true|false|null|undefined)\b/g, '');
  const pattern = /(^|[^.\w$])([A-Za-z_$][\w$]*|\$[A-Za-z_][\w$]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sanitized))) identifiers.add(match[2]);
  return [...identifiers];
}

function stripStrings(expression: string): string {
  return expression.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '');
}

function countArguments(args: string): number {
  const trimmed = args.trim();
  if (!trimmed) return 0;
  return trimmed.split(',').map(arg => arg.trim()).filter(Boolean).length;
}

function extractClassBodies(source: string): string[] {
  const bodies: string[] = [];
  const classPattern = /class\s+[A-Za-z_$][\w$]*[^\{]*\{/g;
  let match: RegExpExecArray | null;

  while ((match = classPattern.exec(source))) {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = findMatchingBrace(source, bodyStart - 1);
    if (bodyEnd > bodyStart) bodies.push(source.slice(bodyStart, bodyEnd));
    classPattern.lastIndex = bodyEnd > bodyStart ? bodyEnd + 1 : bodyStart;
  }

  return bodies;
}

function collectClassFields(classBody: string, members: Set<string>) {
  const fieldPattern = /(?:^|[;\n\r])\s*(?:public\s+|protected\s+|readonly\s+|override\s+|static\s+)*([A-Za-z_$][\w$]*)\s*(?::[^=;]+)?=/g;
  let match: RegExpExecArray | null;
  while ((match = fieldPattern.exec(classBody))) members.add(match[1]);
}

function collectClassMethods(classBody: string, members: Set<string>) {
  const methodPattern = /(?:^|[;\n\r])\s*(?:public\s+|protected\s+|override\s+|async\s+|static\s+)*([A-Za-z_$][\w$]*)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = methodPattern.exec(classBody))) {
    const name = match[1];
    if (!['if', 'for', 'while', 'switch', 'catch', 'constructor'].includes(name)) members.add(name);
  }
}

function collectAccessors(classBody: string, members: Set<string>) {
  const accessorPattern = /(?:^|[;\n\r])\s*(?:public\s+|protected\s+|override\s+|static\s+)*(?:get|set)\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = accessorPattern.exec(classBody))) members.add(match[1]);
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < source.length; index++) {
    const char = source[index];
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return index;
    }
  }
  return -1;
}
