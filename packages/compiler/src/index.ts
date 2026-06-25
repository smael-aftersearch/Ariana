export type ArianaTemplateAstNode =
  | ArianaRootNode
  | ArianaTextNode
  | ArianaInterpolationNode
  | ArianaIfBlockNode
  | ArianaForBlockNode;

export type ArianaRootNode = {
  kind: 'Root';
  children: ArianaTemplateAstNode[];
};

export type ArianaTextNode = {
  kind: 'Text';
  value: string;
};

export type ArianaInterpolationNode = {
  kind: 'Interpolation';
  expression: string;
};

export type ArianaIfBlockNode = {
  kind: 'IfBlock';
  expression: string;
  children: ArianaTemplateAstNode[];
};

export type ArianaForBlockNode = {
  kind: 'ForBlock';
  itemName: string;
  iterableExpression: string;
  trackExpression?: string;
  children: ArianaTemplateAstNode[];
};

export type ArianaTemplateDiagnostic = {
  level: 'error' | 'warning';
  message: string;
  index: number;
};

export type ArianaParseResult = {
  ast: ArianaRootNode;
  diagnostics: ArianaTemplateDiagnostic[];
};

export function parseTemplateToAst(template: string): ArianaParseResult {
  const diagnostics: ArianaTemplateDiagnostic[] = [];
  const children: ArianaTemplateAstNode[] = [];
  const interpolation = /\{\{\s*(.*?)\s*\}\}/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = interpolation.exec(template))) {
    if (match.index > cursor) children.push({ kind: 'Text', value: template.slice(cursor, match.index) });
    children.push({ kind: 'Interpolation', expression: match[1].trim() });
    cursor = match.index + match[0].length;
  }

  if (cursor < template.length) children.push({ kind: 'Text', value: template.slice(cursor) });
  if (template.includes('@else')) diagnostics.push({ level: 'warning', message: '@else is not parsed by the AST preview yet.', index: template.indexOf('@else') });

  return { ast: { kind: 'Root', children }, diagnostics };
}
