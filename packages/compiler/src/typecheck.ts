import { parseTemplateToAst } from './index.js';
import type { ArianaTemplateAstNode, ArianaTemplateDiagnostic } from './index.js';

export type TemplateTypeCheckContext = {
  members: readonly string[];
};

export type TemplateTypeCheckResult = {
  diagnostics: ArianaTemplateDiagnostic[];
};

export function typeCheckTemplate(template: string, context: TemplateTypeCheckContext): TemplateTypeCheckResult {
  const result = parseTemplateToAst(template);
  const diagnostics = [...result.diagnostics];
  const members = new Set(context.members);

  for (const node of result.ast.children) checkNode(node, members, diagnostics);

  return { diagnostics };
}

function checkNode(node: ArianaTemplateAstNode, members: Set<string>, diagnostics: ArianaTemplateDiagnostic[]) {
  if (node.kind === 'Interpolation') checkExpression(node.expression, node.span.start, members, diagnostics);
  if (node.kind === 'IfBlock') {
    checkExpression(node.expression, node.span.start, members, diagnostics);
    for (const child of node.children) checkNode(child, members, diagnostics);
  }
  if (node.kind === 'ForBlock') {
    checkExpression(node.iterableExpression, node.span.start, members, diagnostics);
    const scoped = new Set([...members, node.itemName]);
    if (node.trackExpression) checkExpression(node.trackExpression, node.span.start, scoped, diagnostics);
    for (const child of node.children) checkNode(child, scoped, diagnostics);
  }
  if (node.kind === 'Element') {
    for (const attribute of node.attributes) {
      if (attribute.binding !== 'static') checkExpression(attribute.value, attribute.span.start, members, diagnostics);
    }
    for (const child of node.children) checkNode(child, members, diagnostics);
  }
}

function checkExpression(expression: string, index: number, members: Set<string>, diagnostics: ArianaTemplateDiagnostic[]) {
  const identifiers = extractRootIdentifiers(expression);
  for (const identifier of identifiers) {
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
  const sanitized = expression.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '').replace(/\b(true|false|null|undefined)\b/g, '');
  const pattern = /(^|[^.\w$])([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sanitized))) identifiers.add(match[2]);
  return [...identifiers];
}
