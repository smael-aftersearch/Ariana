# Getting Started with Ariana v1 Alpha

## Requirements

- Node.js 20+
- npm 10+

## Install dependencies

```bash
npm install
```

## Build everything

```bash
npm run build
```

This builds:

- `packages/core`
- `packages/vite-plugin`
- `examples/counter-app`

## Run the demo

```bash
npm run demo:counter
```

Then open the Vite URL printed in the terminal.

## Main demo files

```txt
examples/counter-app/src/counter.page.ts
examples/counter-app/src/counter.page.html
examples/counter-app/src/counter.page.css
examples/counter-app/src/main.ts
```

## First component

```ts
@Component({
  selector: 'ari-counter-page',
  templateUrl: './counter.page.html',
  styleUrl: './counter.page.css'
})
export class CounterPage {
  readonly count = signal(0);

  increment() {
    this.count.update(x => x + 1);
  }
}
```

## Clean generated files

```bash
npm run clean
```

## Alpha limitations

Ariana v1 uses a runtime template parser. This is only to prove the API and architecture.

Do not use v1 as the final performance result against React. The benchmark phase should start after v2 compiler work.
