import { parseTemplateToAst } from './index.js';
import type { ArianaTemplateAstNode, ArianaTemplateDiagnostic } from './index.js';

export type TemplateTypeCheckContext = {
  members: readonly string[];
};

export type TemplateTypeCheckResult = {
  diagnostics: ArianaTemplateDiagnostic[];
};

export type ComponentContextInferenceResult = {
  members: string[];
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

export function typeCheckTemplate(template: string, context: TemplateTypeCheckContext): TemplateTypeCheckResult {
  const result = parseTemplateToAst(template);
  const diagnostics = [...result.diagnostics];
  const members = new Set(context.members);

  for (const node of result.ast.children) checkNode(node, members, diagnostics);

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

function checkNode(node: ArianaTemplateAstNode, members: Set<string>, diagnostics: ArianaTemplateDiagnostic[]) {
  if (node.kind === 'Interpolation') checkExpression(node.expression, node.span.start, members, diagnostics);
  if (node.kind === 'IfBlock') {
    checkExpression(node.expression, node.span.start, members, diagnostics);
    for (const child of node.children) checkNode(child, members, diagnostics);
  }
  if (node.kind === 'ForBlock') {
    checkExpression(node.iterableExpression, node.span.start, members, diagnostics);
    const scoped = new Set([...members, node.itemName, '$index']);
    if (node.trackExpression) checkExpression(node.trackExpression, node.span.start, scoped, diagnostics);
    for (const child of node.children) checkNode(child, scoped, diagnostics);
  }
  if (node.kind === 'Element') {
    for (const attribute of node.attributes) {
      if (attribute.binding === 'static') continue;
      const scoped = attribute.binding === 'event'
        ? new Set([...members, '$event'])
        : members;
      checkExpression(attribute.value, attribute.span.start, scoped, diagnostics);
    }
    for (const child of node.children) checkNode(child, members, diagnostics);
  }
}

function checkExpression(expression: string, index: number, members: Set<string>, diagnostics: ArianaTemplateDiagnostic[]) {
  const identifiers = extractRootIdentifiers(expression);
  for (const identifier of identifiers) {
    if (TEMPLATE_GLOBALS.has(identifier)) continue;
    if (!members.has(identifier)) {
      diagnostics.push({
        level: 'error',
        code: 'ARI_TYPE_UNKNOWN_MEMBER',
        message: `Unknown template member: ${identifier}`,
        index
      });
    }
  }
}

function extractRootIdentifiers(expression: string): string[] {
  const identifiers = new Set<string>();
  const sanitized = expression
    .replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '')
    .replace(/\b(true|false|null|undefined)\b/g, '');
  const pattern = /(^|[^.\w$])([A-Za-z_$][\w$]*|\$[A-Za-z_][\w$]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sanitized))) identifiers.add(match[2]);
  return [...identifiers];
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
