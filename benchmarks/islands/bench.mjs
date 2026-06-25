import { performance } from 'node:perf_hooks';
import { activateIslands, cleanupIslands, defineIsland } from '@ariana/rendering';

const ISLANDS = Number(process.env.ISLANDS ?? 1000);
const RUNS = Number(process.env.RUNS ?? 5);

class MiniElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = new Map();
    this.textContent = '';
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

class MiniRoot {
  constructor(nodes) { this.nodes = nodes; }
  querySelector(selector) {
    if (selector === 'script[data-ariana-islands]') return this.nodes[0];
    const match = selector.match(/^\[data-ariana-island="(.*)"\]$/);
    if (!match) return undefined;
    return this.nodesById.get(match[1]);
  }
}

function median(values) {
  return values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

function createRoot() {
  const islands = [];
  const nodes = [];
  const script = new MiniElement('script');
  script.setAttribute('data-ariana-islands', '');
  nodes.push(script);

  for (let i = 0; i < ISLANDS; i++) {
    const id = `island-${i}`;
    islands.push(defineIsland(id, 'Counter', { value: i }));
    const target = new MiniElement('div');
    target.setAttribute('data-ariana-island', id);
    nodes.push(target);
  }

  script.textContent = JSON.stringify(islands);
  const root = new MiniRoot(nodes);
  root.nodesById = new Map(nodes.slice(1).map(node => [node.attributes.get('data-ariana-island'), node]));
  return root;
}

const samples = [];
for (let run = 0; run < RUNS; run++) {
  const root = createRoot();
  const start = performance.now();
  const result = activateIslands({ Counter: element => { element.setAttribute('data-counter', '1'); } }, root);
  const elapsed = performance.now() - start;
  if (result.activated !== ISLANDS) throw new Error(`Expected ${ISLANDS} activated islands, got ${result.activated}`);
  cleanupIslands(result);
  samples.push((elapsed * 1000) / ISLANDS);
}

const medianUs = Number(median(samples).toFixed(3));
const gateUs = 25;

console.log(JSON.stringify({ islands: ISLANDS, runs: RUNS, medianUs, samples: samples.map(sample => Number(sample.toFixed(3))), gateUs }, null, 2));

if (medianUs > gateUs) throw new Error(`Island activation exceeded gate: ${medianUs}us`);
