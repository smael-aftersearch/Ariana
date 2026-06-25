export type ArianaTemplateAstNode =
  | ArianaRootNode
  | ArianaTextNode
  | ArianaElementNode
  | ArianaInterpolationNode
  | ArianaIfBlockNode
  | ArianaForBlockNode;

export type ArianaSourceSpan = {
  start: number;
  end: number;
};

export type ArianaRootNode = {
  kind: 'Root';
  children: ArianaTemplateAstNode[];
  span: ArianaSourceSpan;
};

export type ArianaTextNode = {
  kind: 'Text';
  value: string;
  span: ArianaSourceSpan;
};

export type ArianaAttributeBinding = 'text' | 'property' | 'event' | 'class' | 'static';

export type ArianaAttributeNode = {
  name: string;
  value: string;
  binding: ArianaAttributeBinding;
  span: ArianaSourceSpan;
};

export type ArianaElementNode = {
  kind: 'Element';
  tagName: string;
  attributes: ArianaAttributeNode[];
  children: ArianaTemplateAstNode[];
  span: ArianaSourceSpan;
};

export type ArianaInterpolationNode = {
  kind: 'Interpolation';
  expression: string;
  span: ArianaSourceSpan;
};

export type ArianaIfBlockNode = {
  kind: 'IfBlock';
  expression: string;
  children: ArianaTemplateAstNode[];
  span: ArianaSourceSpan;
};

export type ArianaForBlockNode = {
  kind: 'ForBlock';
  itemName: string;
  iterableExpression: string;
  trackExpression?: string;
  children: ArianaTemplateAstNode[];
  span: ArianaSourceSpan;
};

export type ArianaTemplateDiagnostic = {
  level: 'error' | 'warning';
  code: string;
  message: string;
  index: number;
};

export type ArianaParseResult = {
  ast: ArianaRootNode;
  diagnostics: ArianaTemplateDiagnostic[];
};

export function parseTemplateToAst(template: string): ArianaParseResult {
  const parser = new TemplateAstParser(template);
  return parser.parseRoot();
}

class TemplateAstParser {
  private index = 0;
  private readonly diagnostics: ArianaTemplateDiagnostic[] = [];

  constructor(private readonly source: string) {}

  parseRoot(): ArianaParseResult {
    const children = this.parseChildren();
    return { ast: { kind: 'Root', children, span: { start: 0, end: this.source.length } }, diagnostics: this.diagnostics };
  }

  private parseChildren(stopTag?: string): ArianaTemplateAstNode[] {
    const nodes: ArianaTemplateAstNode[] = [];

    while (this.index < this.source.length) {
      if (stopTag && this.source.startsWith(`</${stopTag}`, this.index)) break;
      if (this.source.startsWith('{{', this.index)) { nodes.push(this.parseInterpolation()); continue; }
      if (this.source.startsWith('@if', this.index)) { nodes.push(this.parseIfBlock()); continue; }
      if (this.source.startsWith('@for', this.index)) { nodes.push(this.parseForBlock()); continue; }
      if (this.source[this.index] === '<') {
        if (this.source.startsWith('</', this.index)) break;
        const element = this.parseElement();
        if (element) { nodes.push(element); continue; }
      }
      nodes.push(this.parseText(stopTag));
    }

    return nodes.filter(node => node.kind !== 'Text' || node.value.length > 0);
  }

  private parseText(stopTag?: string): ArianaTextNode {
    const start = this.index;
    const candidates = [this.source.indexOf('{{', start), this.source.indexOf('@if', start), this.source.indexOf('@for', start), this.source.indexOf('<', start)]
      .filter(index => index >= 0);
    if (stopTag) {
      const closeIndex = this.source.indexOf(`</${stopTag}`, start);
      if (closeIndex >= 0) candidates.push(closeIndex);
    }
    const end = candidates.length > 0 ? Math.min(...candidates) : this.source.length;
    this.index = end;
    return { kind: 'Text', value: this.source.slice(start, end), span: { start, end } };
  }

  private parseInterpolation(): ArianaInterpolationNode {
    const start = this.index;
    const end = this.source.indexOf('}}', start + 2);
    if (end < 0) {
      this.diagnostics.push({ level: 'error', code: 'ARI_UNCLOSED_INTERPOLATION', message: 'Interpolation is missing closing braces.', index: start });
      this.index = this.source.length;
      return { kind: 'Interpolation', expression: this.source.slice(start + 2).trim(), span: { start, end: this.source.length } };
    }
    this.index = end + 2;
    return { kind: 'Interpolation', expression: this.source.slice(start + 2, end).trim(), span: { start, end: this.index } };
  }

  private parseElement(): ArianaElementNode | undefined {
    const start = this.index;
    const openEnd = this.source.indexOf('>', start + 1);
    if (openEnd < 0) {
      this.diagnostics.push({ level: 'error', code: 'ARI_UNCLOSED_ELEMENT', message: 'Element is missing closing angle bracket.', index: start });
      this.index = this.source.length;
      return undefined;
    }

    const rawOpen = this.source.slice(start + 1, openEnd).trim();
    const selfClosing = rawOpen.endsWith('/');
    const openContent = selfClosing ? rawOpen.slice(0, -1).trim() : rawOpen;
    const tagMatch = /^([A-Za-z][\w-]*)/.exec(openContent);

    if (!tagMatch) {
      this.diagnostics.push({ level: 'error', code: 'ARI_INVALID_ELEMENT', message: 'Invalid element tag.', index: start });
      this.index = openEnd + 1;
      return undefined;
    }

    const tagName = tagMatch[1];
    const attributeSource = openContent.slice(tagName.length).trim();
    const attributes = parseAttributes(attributeSource, start + 1 + tagName.length, this.diagnostics);
    this.index = openEnd + 1;
    const children = selfClosing ? [] : this.parseChildren(tagName);

    if (!selfClosing) {
      if (this.source.startsWith(`</${tagName}`, this.index)) {
        const closeEnd = this.source.indexOf('>', this.index);
        this.index = closeEnd < 0 ? this.source.length : closeEnd + 1;
      } else {
        this.diagnostics.push({ level: 'error', code: 'ARI_MISSING_CLOSE_TAG', message: `Element <${tagName}> is missing a matching close tag.`, index: start });
      }
    }

    return { kind: 'Element', tagName, attributes, children, span: { start, end: this.index } };
  }

  private parseIfBlock(): ArianaIfBlockNode {
    const start = this.index;
    const parsed = this.readControlBlock('@if');
    const childParser = new TemplateAstParser(parsed.content);
    const result = childParser.parseRoot();
    this.diagnostics.push(...result.diagnostics.map(diagnostic => ({ ...diagnostic, index: parsed.contentStart + diagnostic.index })));
    return { kind: 'IfBlock', expression: parsed.expression, children: result.ast.children, span: { start, end: parsed.endIndex } };
  }

  private parseForBlock(): ArianaForBlockNode {
    const start = this.index;
    const parsed = this.readControlBlock('@for');
    const forParts = parseForExpression(parsed.expression, start, this.diagnostics);
    const childParser = new TemplateAstParser(parsed.content);
    const result = childParser.parseRoot();
    this.diagnostics.push(...result.diagnostics.map(diagnostic => ({ ...diagnostic, index: parsed.contentStart + diagnostic.index })));
    return { kind: 'ForBlock', ...forParts, children: result.ast.children, span: { start, end: parsed.endIndex } };
  }

  private readControlBlock(kind: '@if' | '@for') {
    const start = this.index;
    const expressionStart = this.source.indexOf('(', start);
    if (expressionStart < 0) return this.invalidControlBlock(kind, start, 'Control block is missing expression.');
    const expressionEnd = findMatching(this.source, expressionStart, '(', ')');
    if (expressionEnd < 0) return this.invalidControlBlock(kind, start, 'Control block expression is not closed.');
    const bodyStart = this.source.indexOf('{', expressionEnd);
    if (bodyStart < 0) return this.invalidControlBlock(kind, start, 'Control block is missing body.');
    const bodyEnd = findMatching(this.source, bodyStart, '{', '}');
    if (bodyEnd < 0) return this.invalidControlBlock(kind, start, 'Control block body is not closed.');

    this.index = bodyEnd + 1;
    return {
      expression: this.source.slice(expressionStart + 1, expressionEnd).trim(),
      content: this.source.slice(bodyStart + 1, bodyEnd),
      contentStart: bodyStart + 1,
      endIndex: this.index
    };
  }

  private invalidControlBlock(kind: '@if' | '@for', start: number, message: string) {
    this.diagnostics.push({ level: 'error', code: kind === '@if' ? 'ARI_INVALID_IF' : 'ARI_INVALID_FOR', message, index: start });
    this.index = this.source.length;
    return { expression: '', content: '', contentStart: this.source.length, endIndex: this.source.length };
  }
}

function parseAttributes(source: string, offset: number, diagnostics: ArianaTemplateDiagnostic[]): ArianaAttributeNode[] {
  const attributes: ArianaAttributeNode[] = [];
  const pattern = /([^\s=]+)(?:\s*=\s*"([^"]*)")?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const rawName = match[1];
    const value = match[2] ?? '';
    const span = { start: offset + match.index, end: offset + match.index + match[0].length };
    attributes.push(parseAttribute(rawName, value, span, diagnostics));
  }

  return attributes;
}

function parseAttribute(name: string, value: string, span: ArianaSourceSpan, diagnostics: ArianaTemplateDiagnostic[]): ArianaAttributeNode {
  const property = /^\[([\w-]+)\]$/.exec(name);
  if (property) return { name: property[1], value, binding: 'property', span };

  const event = /^\(([\w-]+)\)$/.exec(name);
  if (event) return { name: event[1], value, binding: 'event', span };

  const classBinding = /^\[class\.([\w-]+)\]$/.exec(name);
  if (classBinding) return { name: classBinding[1], value, binding: 'class', span };

  if (name.startsWith('[') || name.startsWith('(')) diagnostics.push({ level: 'warning', code: 'ARI_UNKNOWN_BINDING', message: `Unknown binding syntax: ${name}`, index: span.start });
  return { name, value, binding: 'static', span };
}

function parseForExpression(expression: string, index: number, diagnostics: ArianaTemplateDiagnostic[]): Pick<ArianaForBlockNode, 'itemName' | 'iterableExpression' | 'trackExpression'> {
  const match = /^([A-Za-z_$][\w$]*)\s+of\s+(.+?)(?:;\s*track\s+(.+))?$/.exec(expression);
  if (!match) {
    diagnostics.push({ level: 'error', code: 'ARI_INVALID_FOR_EXPRESSION', message: `Invalid @for expression: ${expression}`, index });
    return { itemName: '$item', iterableExpression: '[]' };
  }
  return { itemName: match[1], iterableExpression: match[2].trim(), trackExpression: match[3]?.trim() };
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
