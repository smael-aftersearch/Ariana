import { Component, Route, computed, signal } from '@ariana/core';

type SceneKey = 'flow' | 'data' | 'security';

@Route('/animate')
@Component({ selector: 'ari-admin-animate-page', templateUrl: './animate.page.html', styleUrl: './animate.page.scss' })
export class AnimatePage {
  readonly showHero = signal(true);
  readonly showOrb = signal(true);
  readonly showPanel = signal(true);
  readonly slowMode = signal(true);
  readonly selectedScene = signal<SceneKey>('flow');
  readonly cards = signal([
    { id: 'A-1001', title: 'Enter lifecycle', subtitle: 'Class is applied after mount', status: 'visible' },
    { id: 'A-1002', title: 'Leave lifecycle', subtitle: 'Node removal waits for animation', status: 'visible' },
    { id: 'A-1003', title: 'Signal row', subtitle: 'Rows are added through signal state', status: 'visible' }
  ]);
  readonly staggerItems = signal([
    { id: 'S-01', label: 'Compile template', tone: 'violet' },
    { id: 'S-02', label: 'Mount fragment', tone: 'sky' },
    { id: 'S-03', label: 'Apply enter class', tone: 'emerald' },
    { id: 'S-04', label: 'Read CSS duration', tone: 'amber' }
  ]);

  readonly speedLabel = computed(() => this.slowMode() ? 'Slow / visible' : 'Normal');
  readonly sceneTitle = computed(() => {
    const scene = this.selectedScene();
    if (scene === 'data') return 'Data transition';
    if (scene === 'security') return 'Security transition';
    return 'Runtime flow';
  });
  readonly sceneSummary = computed(() => {
    const scene = this.selectedScene();
    if (scene === 'data') return 'Shows signal-driven UI changes without a global observer.';
    if (scene === 'security') return 'Shows class-only animation values and no runtime expression evaluation.';
    return 'Shows how enter and leave classes move through the compiled render lifecycle.';
  });

  sceneSteps() {
    const scene = this.selectedScene();
    if (scene === 'data') {
      return [
        { title: 'Signal update', description: 'A signal changes the active view.' },
        { title: 'Fragment diff', description: 'The compiled block updates only the affected fragment.' },
        { title: 'Animated cleanup', description: 'Leaving nodes wait for CSS duration before removal.' }
      ];
    }
    if (scene === 'security') {
      return [
        { title: 'Static class list', description: 'Animation values are validated as CSS class names.' },
        { title: 'No dynamic eval', description: 'The animation API does not evaluate JavaScript strings.' },
        { title: 'Bounded fallback', description: 'Missing browser events cannot leak DOM nodes forever.' }
      ];
    }
    return [
      { title: 'Compile', description: 'Template markers become generated render instructions.' },
      { title: 'Mount', description: 'The fragment is inserted into the host.' },
      { title: 'Animate', description: 'Enter classes are applied after the next frame.' }
    ];
  }

  toggleHero() {
    this.showHero.update(value => !value);
  }

  toggleOrb() {
    this.showOrb.update(value => !value);
  }

  togglePanel() {
    this.showPanel.update(value => !value);
  }

  toggleSpeed() {
    this.slowMode.update(value => !value);
  }

  setScene(scene: SceneKey) {
    this.selectedScene.set(scene);
  }

  addCard() {
    const index = this.cards().length + 1;
    this.cards.update(cards => [
      ...cards,
      {
        id: `A-${1000 + index}`,
        title: `Generated animation ${index}`,
        subtitle: 'New row entered with animate.enter',
        status: 'new'
      }
    ]);
  }

  removeCard(id: string) {
    this.cards.update(cards => cards.filter(card => card.id !== id));
  }

  addStaggerItem() {
    const index = this.staggerItems().length + 1;
    this.staggerItems.update(items => [
      ...items,
      { id: `S-${String(index).padStart(2, '0')}`, label: `Stagger item ${index}`, tone: index % 2 === 0 ? 'sky' : 'violet' }
    ]);
  }

  removeStaggerItem(id: string) {
    this.staggerItems.update(items => items.filter(item => item.id !== id));
  }

  replayAll() {
    this.showHero.set(false);
    this.showOrb.set(false);
    this.showPanel.set(false);
    setTimeout(() => {
      this.showHero.set(true);
      this.showOrb.set(true);
      this.showPanel.set(true);
    }, 80);
  }
}
