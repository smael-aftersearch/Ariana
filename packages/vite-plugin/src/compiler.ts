type CompileResult =
  | { renderCode: string; reason?: never }
  | { renderCode?: never; reason: string };

type LocalAccessMap = Record<string, string>;

export function compileTemplateToRender(template: string): CompileResult {
  try {
    const idState = { ifId: 0, forId: 0 };
    const segment = compileTemplateSegment(template, idState);
    const lines: string[] = [];

    lines.push(`function __ari_render(ctx, host) {`);
    lines.push(`  const __ari_createFragment = (html) => document.createRange().createContextualFragment(html);`);
    lines.push(`  host.replaceChildren(__ari_createFragment(${JSON.stringify(segment.html)}));`);
    lines.push(`  const cleanups = [];`);
    appendBindingLines(lines, segment, 'host', 'ctx', 'cleanups', 'root', {});
    lines.push(`  return () => { for (const cleanup of cleanups.splice(0)) cleanup(); };`);
    lines.push(`}`);

    return { renderCode: lines.join('\n') };
  } catch (error) {
    return { reason: error instanceof Error ? error.message : 'template compiler failed' };
  }
}

type CompiledTemplateSegment = {
  html: string;
  textBindings: string[];
  propBindings: Array<{ marker: string; propertyName: string; expression: string }>;
  classBindings: Array<{ marker: string; className: string; expression: string }>;
  eventBindings: Array<{ marker: string; eventName: string; statement: string }>;
  ifBlocks: Array<{ anchorId: number; expression: string; segment: CompiledTemplateSegment }>;
  forBlocks: Array<{ anchorId: number; itemName: string; iterableExpression: string; trackExpression?: string; segment: CompiledTemplateSegment }>;
};

function compileTemplateSegment(template: string, idState: { ifId: number; forId: number }): CompiledTemplateSegment {
  const ifBlocks: CompiledTemplateSegment['ifBlocks'] = [];
  const forBlocks: CompiledTemplateSegment['forBlocks'] = [];
  let html = transformControlBlocks(template, idState, ifBlocks, forBlocks);

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

  return { html, textBindings, propBindings, classBindings, eventBindings, ifBlocks, forBlocks };
}

function transformControlBlocks(
  source: string,
  idState: { ifId: number; forId: number },
  ifBlocks: CompiledTemplateSegment['ifBlocks'],
  forBlocks: CompiledTemplateSegment['forBlocks']
): string {
  let index = 0;
  let output = '';

  while (index < source.length) {
    const next = findNextControlMarker(source, index);

    if (!next) {
      output += source.slice(index);
      break;
    }

    output += source.slice(index, next.index);

    if (next.kind === 'if') {
      const parsed = readControlBlock(source, next.index, '@if');
      const anchorId = idState.ifId++;
      const segment = compileTemplateSegment(parsed.content, idState);
      ifBlocks.push({ anchorId, expression: parsed.expression, segment });
      output += `<span data-ari-if-anchor="${anchorId}"></span>`;
      index = parsed.endIndex;
      continue;
    }

    const parsed = readControlBlock(source, next.index, '@for');
    const forParts = parseForExpression(parsed.expression);
    const anchorId = idState.forId++;
    const segment = compileTemplateSegment(parsed.content, idState);
    forBlocks.push({ anchorId, ...forParts, segment });
    output += `<span data-ari-for-anchor="${anchorId}"></span>`;
    index = parsed.endIndex;
  }

  return output;
}

function findNextControlMarker(source: string, start: number): { kind: 'if' | 'for'; index: number } | undefined {
  const ifIndex = source.indexOf('@if', start);
  const forIndex = source.indexOf('@for', start);
  if (ifIndex === -1 && forIndex === -1) return undefined;
  if (ifIndex !== -1 && (forIndex === -1 || ifIndex < forIndex)) return { kind: 'if', index: ifIndex };
  return { kind: 'for', index: forIndex };
}

function readControlBlock(source: string, markerIndex: number, marker: '@if' | '@for'): { expression: string; content: string; endIndex: number } {
  let cursor = markerIndex + marker.length;
  while (source[cursor] && /\s/.test(source[cursor])) cursor++;
  if (source[cursor] !== '(') throw new Error(`Invalid Ariana ${marker} block: missing condition.`);
  const expressionEnd = findMatching(source, cursor, '(', ')');
  const expression = source.slice(cursor + 1, expressionEnd).trim();
  cursor = expressionEnd + 1;
  while (source[cursor] && /\s/.test(source[cursor])) cursor++;
  if (source[cursor] !== '{') throw new Error(`Invalid Ariana ${marker} block: missing body.`);
  const blockEnd = findMatching(source, cursor, '{', '}');
  return { expression, content: source.slice(cursor + 1, blockEnd), endIndex: blockEnd + 1 };
}

function parseForExpression(expression: string): { itemName: string; iterableExpression: string; trackExpression?: string } {
  const match = expression.match(/^\s*([A-Za-z_$][\w$]*)\s+of\s+(.+?)(?:;\s*track\s+(.+))?\s*$/);
  if (!match) throw new Error(`Invalid Ariana @for expression: ${expression}`);
  return { itemName: match[1], iterableExpression: match[2].trim(), trackExpression: match[3]?.trim() };
}

function appendBindingLines(
  lines: string[],
  segment: CompiledTemplateSegment,
  rootVar: string,
  ctxVar: string,
  cleanupsVar: string,
  prefix: string,
  localAccess: LocalAccessMap
) {
  segment.textBindings.forEach((expression, index) => {
    const variable = `${prefix}_text_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[data-ari-text="${index}"]');`);
    lines.push(`  if (${variable}) ${cleanupsVar}.push(__ari_effect(() => { ${variable}.textContent = String((${compileExpression(expression, ctxVar, localAccess)}) ?? ''); }));`);
  });

  segment.classBindings.forEach((binding, index) => {
    const variable = `${prefix}_class_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[${binding.marker}]');`);
    lines.push(`  if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); ${cleanupsVar}.push(__ari_effect(() => { ${variable}.classList.toggle(${JSON.stringify(binding.className)}, Boolean(${compileExpression(binding.expression, ctxVar, localAccess)})); })); }`);
  });

  segment.propBindings.forEach((binding, index) => {
    const variable = `${prefix}_prop_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[${binding.marker}]');`);
    lines.push(`  if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); ${cleanupsVar}.push(__ari_effect(() => { const value = ${compileExpression(binding.expression, ctxVar, localAccess)}; if (${JSON.stringify(binding.propertyName)} in ${variable}) ${variable}[${JSON.stringify(binding.propertyName)}] = value; else if (value == null || value === false) ${variable}.removeAttribute(${JSON.stringify(binding.propertyName)}); else ${variable}.setAttribute(${JSON.stringify(binding.propertyName)}, String(value)); })); }`);
  });

  segment.eventBindings.forEach((binding, index) => {
    const variable = `${prefix}_event_${index}`;
    const listener = `${prefix}_listener_${index}`;
    lines.push(`  const ${variable} = ${rootVar}.querySelector('[${binding.marker}]');`);
    lines.push(`  if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); const ${listener} = ($event) => { ${compileStatement(binding.statement, ctxVar, localAccess)}; }; ${variable}.addEventListener(${JSON.stringify(binding.eventName)}, ${listener}); ${cleanupsVar}.push(() => ${variable}.removeEventListener(${JSON.stringify(binding.eventName)}, ${listener})); }`);
  });

  appendIfBlockLines(lines, segment, rootVar, ctxVar, cleanupsVar, prefix, localAccess);
  appendForBlockLines(lines, segment, rootVar, ctxVar, cleanupsVar, prefix, localAccess);
}

function appendIfBlockLines(lines: string[], segment: CompiledTemplateSegment, rootVar: string, ctxVar: string, cleanupsVar: string, prefix: string, localAccess: LocalAccessMap) {
  segment.ifBlocks.forEach((block, index) => {
    const anchor = `${prefix}_if_anchor_${index}`;
    const mountedNodes = `${prefix}_if_nodes_${index}`;
    const childCleanups = `${prefix}_if_cleanups_${index}`;
    const fragment = `${prefix}_if_fragment_${index}`;
    const nodes = `${prefix}_if_new_nodes_${index}`;
    const nestedPrefix = `${prefix}_if_${index}`;
    lines.push(`  const ${anchor} = ${rootVar}.querySelector('[data-ari-if-anchor="${block.anchorId}"]');`);
    lines.push(`  let ${mountedNodes} = [];`);
    lines.push(`  let ${childCleanups} = [];`);
    lines.push(`  if (${anchor}) { ${anchor}.removeAttribute('data-ari-if-anchor'); ${cleanupsVar}.push(__ari_effect(() => {`);
    lines.push(`    for (const cleanup of ${childCleanups}.splice(0)) cleanup();`);
    lines.push(`    for (const node of ${mountedNodes}.splice(0)) node.parentNode?.removeChild(node);`);
    lines.push(`    if (Boolean(${compileExpression(block.expression, ctxVar, localAccess)})) {`);
    lines.push(`      const ${fragment} = __ari_createFragment(${JSON.stringify(block.segment.html)});`);
    lines.push(`      const ${nodes} = Array.from(${fragment}.childNodes);`);
    appendBindingLines(lines, block.segment, fragment, ctxVar, childCleanups, nestedPrefix, localAccess);
    lines.push(`      ${anchor}.after(${fragment});`);
    lines.push(`      ${mountedNodes} = ${nodes};`);
    lines.push(`    }`);
    lines.push(`  })); }`);
  });
}

function appendForBlockLines(lines: string[], segment: CompiledTemplateSegment, rootVar: string, ctxVar: string, cleanupsVar: string, prefix: string, localAccess: LocalAccessMap) {
  segment.forBlocks.forEach((block, index) => {
    if (canUseFastRowBinding(block.segment)) {
      appendFastForBlockLines(lines, block, rootVar, ctxVar, cleanupsVar, prefix, localAccess, index);
      return;
    }
    appendSignalForBlockLines(lines, block, rootVar, ctxVar, cleanupsVar, prefix, localAccess, index);
  });
}

function canUseFastRowBinding(segment: CompiledTemplateSegment): boolean {
  return segment.ifBlocks.length === 0 && segment.forBlocks.length === 0;
}

type ForBlock = CompiledTemplateSegment['forBlocks'][number];

function appendFastForBlockLines(lines: string[], block: ForBlock, rootVar: string, ctxVar: string, cleanupsVar: string, prefix: string, localAccess: LocalAccessMap, index: number) {
  const anchor = `${prefix}_for_anchor_${index}`;
  const values = `${prefix}_for_values_${index}`;
  const records = `${prefix}_for_records_${index}`;
  const oldRecords = `${prefix}_for_old_records_${index}`;
  const key = `${prefix}_for_key_${index}`;
  const record = `${prefix}_for_record_${index}`;
  const removedRecord = `${prefix}_for_removed_record_${index}`;
  const fragment = `${prefix}_for_fragment_${index}`;
  const nodes = `${prefix}_for_nodes_${index}`;
  const nestedPrefix = `${prefix}_for_fast_${index}`;
  const sync = `${prefix}_for_sync_${index}`;
  const source = `${prefix}_for_source_${index}`;
  const changeRecord = `${prefix}_for_change_record_${index}`;
  const sourceExpression = getSimpleListSourceExpression(block.iterableExpression, ctxVar, localAccess);
  const keyLocalAccess: LocalAccessMap = { ...localAccess, [block.itemName]: block.itemName, $index: '$index' };
  const rowLocalAccess: LocalAccessMap = { ...localAccess, [block.itemName]: `${record}.item`, $index: `${record}.index` };
  const keyExpression = block.trackExpression ? compileExpression(block.trackExpression, ctxVar, keyLocalAccess) : '$index';

  lines.push(`  const ${anchor} = ${rootVar}.querySelector('[data-ari-for-anchor="${block.anchorId}"]');`);
  lines.push(`  let ${records} = new Map();`);
  lines.push(`  if (${anchor}) { ${anchor}.removeAttribute('data-ari-for-anchor');`);
  lines.push(`    ${cleanupsVar}.push(() => { for (const entry of ${records}.values()) { for (const cleanup of entry.cleanups.splice(0)) cleanup(); for (const node of entry.nodes) node.parentNode?.removeChild(node); } ${records}.clear(); });`);
  if (sourceExpression) lines.push(`    const ${source} = ${sourceExpression};`);
  lines.push(`    const ${sync} = () => {`);
  lines.push(`      const ${oldRecords} = ${records};`);
  lines.push(`      ${records} = new Map();`);
  lines.push(`      const ${values} = Array.from((${compileExpression(block.iterableExpression, ctxVar, localAccess)}) ?? []);`);
  lines.push(`      let previousNode = ${anchor};`);
  lines.push(`      for (let i = 0; i < ${values}.length; i++) {`);
  lines.push(`        const ${block.itemName} = ${values}[i];`);
  lines.push(`        const $index = i;`);
  lines.push(`        const ${key} = ${keyExpression};`);
  lines.push(`        let ${record} = ${oldRecords}.get(${key});`);
  lines.push(`        if (${record}) {`);
  lines.push(`          const sameItem = Object.is(${record}.item, ${block.itemName});`);
  lines.push(`          const sameIndex = ${record}.index === i;`);
  lines.push(`          ${record}.item = ${block.itemName};`);
  lines.push(`          ${record}.index = i;`);
  lines.push(`          if (!sameItem || !sameIndex) ${record}.update();`);
  lines.push(`          ${records}.set(${key}, ${record});`);
  lines.push(`        } else {`);
  lines.push(`          const ${fragment} = __ari_createFragment(${JSON.stringify(block.segment.html)});`);
  lines.push(`          const ${nodes} = Array.from(${fragment}.childNodes);`);
  lines.push(`          ${record} = { item: ${block.itemName}, index: i, nodes: ${nodes}, cleanups: [], update: () => {} };`);
  appendFastRowInitLines(lines, block.segment, fragment, ctxVar, record, nestedPrefix, rowLocalAccess);
  lines.push(`          ${record}.update();`);
  lines.push(`          ${records}.set(${key}, ${record});`);
  lines.push(`        }`);
  lines.push(`        for (const node of ${record}.nodes) { if (previousNode.nextSibling !== node) previousNode.after(node); previousNode = node; }`);
  lines.push(`      }`);
  lines.push(`      for (const [key, ${removedRecord}] of ${oldRecords}) {`);
  lines.push(`        if (!${records}.has(key)) {`);
  lines.push(`          for (const cleanup of ${removedRecord}.cleanups.splice(0)) cleanup();`);
  lines.push(`          for (const node of ${removedRecord}.nodes) node.parentNode?.removeChild(node);`);
  lines.push(`        }`);
  lines.push(`      }`);
  lines.push(`    };`);
  lines.push(`    ${sync}();`);
  if (sourceExpression) {
    lines.push(`    if (${source} && typeof ${source}.subscribeChanges === 'function') {`);
    lines.push(`      ${cleanupsVar}.push(${source}.subscribeChanges((change) => {`);
    lines.push(`        if (change.type === 'update') {`);
    lines.push(`          const ${changeRecord} = ${records}.get(change.key);`);
    lines.push(`          if (${changeRecord}) { ${changeRecord}.item = change.item; ${changeRecord}.index = change.index; ${changeRecord}.update(); return; }`);
    lines.push(`        }`);
    lines.push(`        ${sync}();`);
    lines.push(`      }));`);
    lines.push(`    } else { ${cleanupsVar}.push(__ari_effect(${sync})); }`);
  } else {
    lines.push(`    ${cleanupsVar}.push(__ari_effect(${sync}));`);
  }
  lines.push(`  }`);
}

function appendFastRowInitLines(lines: string[], segment: CompiledTemplateSegment, fragmentVar: string, ctxVar: string, recordVar: string, prefix: string, localAccess: LocalAccessMap) {
  const updateLines: string[] = [];
  segment.textBindings.forEach((expression, index) => {
    const variable = `${prefix}_text_${index}`;
    lines.push(`          const ${variable} = ${fragmentVar}.querySelector('[data-ari-text="${index}"]');`);
    updateLines.push(`if (${variable}) ${variable}.textContent = String((${compileExpression(expression, ctxVar, localAccess)}) ?? '');`);
  });
  segment.classBindings.forEach((binding, index) => {
    const variable = `${prefix}_class_${index}`;
    lines.push(`          const ${variable} = ${fragmentVar}.querySelector('[${binding.marker}]');`);
    lines.push(`          if (${variable}) ${variable}.removeAttribute('${binding.marker}');`);
    updateLines.push(`if (${variable}) ${variable}.classList.toggle(${JSON.stringify(binding.className)}, Boolean(${compileExpression(binding.expression, ctxVar, localAccess)}));`);
  });
  segment.propBindings.forEach((binding, index) => {
    const variable = `${prefix}_prop_${index}`;
    const propertyName = JSON.stringify(binding.propertyName);
    lines.push(`          const ${variable} = ${fragmentVar}.querySelector('[${binding.marker}]');`);
    lines.push(`          if (${variable}) ${variable}.removeAttribute('${binding.marker}');`);
    updateLines.push(`if (${variable}) { const value = ${compileExpression(binding.expression, ctxVar, localAccess)}; if (${propertyName} in ${variable}) ${variable}[${propertyName}] = value; else if (value == null || value === false) ${variable}.removeAttribute(${propertyName}); else ${variable}.setAttribute(${propertyName}, String(value)); }`);
  });
  segment.eventBindings.forEach((binding, index) => {
    const variable = `${prefix}_event_${index}`;
    const listener = `${prefix}_listener_${index}`;
    lines.push(`          const ${variable} = ${fragmentVar}.querySelector('[${binding.marker}]');`);
    lines.push(`          if (${variable}) { ${variable}.removeAttribute('${binding.marker}'); const ${listener} = ($event) => { ${compileStatement(binding.statement, ctxVar, localAccess)}; }; ${variable}.addEventListener(${JSON.stringify(binding.eventName)}, ${listener}); ${recordVar}.cleanups.push(() => ${variable}.removeEventListener(${JSON.stringify(binding.eventName)}, ${listener})); }`);
  });
  lines.push(`          ${recordVar}.update = () => { ${updateLines.join(' ')} };`);
}

function appendSignalForBlockLines(lines: string[], block: ForBlock, rootVar: string, ctxVar: string, cleanupsVar: string, prefix: string, localAccess: LocalAccessMap, index: number) {
  appendFastForBlockLines(lines, block, rootVar, ctxVar, cleanupsVar, prefix, localAccess, index);
}

function getSimpleListSourceExpression(expression: string, contextName: string, localAccess: LocalAccessMap): string | undefined {
  const match = expression.match(/^\s*([A-Za-z_$][\w$]*)\s*\(\s*\)\s*$/);
  if (!match) return undefined;
  const name = match[1];
  if (localAccess[name] || isGlobalFunction(name)) return undefined;
  return `${contextName}.${name}`;
}

function findMatching(source: string, start: number, open: string, close: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    const previous = source[i - 1];
    if (quote) {
      if (char === quote && previous !== '\\') quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === open) depth++;
    if (char === close) depth--;
    if (depth === 0) return i;
  }
  throw new Error(`Ariana template parser could not find matching ${close}.`);
}

function compileExpression(expression: string, contextName = 'ctx', localAccess: LocalAccessMap = {}): string {
  const withLocals = expression.replace(/(?<![\w.$])([A-Za-z_$][\w$]*|\$index)/g, (match, name: string) => localAccess[name] ?? match);
  return withLocals.replace(/(?<![\w.$])([A-Za-z_$][\w$]*)\s*\(/g, (match, name: string) => {
    if (isGlobalFunction(name)) return match;
    return `${contextName}.${name}(`;
  });
}

function compileStatement(statement: string, contextName = 'ctx', localAccess: LocalAccessMap = {}): string {
  return compileExpression(statement, contextName, localAccess);
}

function isGlobalFunction(name: string): boolean {
  return new Set(['Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'Math', 'parseInt', 'parseFloat', 'isNaN', 'isFinite']).has(name);
}
