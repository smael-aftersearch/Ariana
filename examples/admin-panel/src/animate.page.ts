import { Component, Route, computed, signal } from '@ariana/core';

@Route('/animate')
@Component({ selector: 'ari-admin-animate-page', templateUrl: './animate.page.html', styleUrl: './animate.page.scss' })
export class AnimatePage {
  readonly showHero = signal(true);
  readonly showOrb = signal(true);
  readonly showPanel = signal(true);
  readonly slowMode = signal(true);
  readonly cards = signal([
    { id: 'A-1001', title: 'Enter lifecycle', subtitle: 'Class is applied after mount', status: 'visible' },
    { id: 'A-1002', title: 'Leave lifecycle', subtitle: 'Node removal waits for animation', status: 'visible' },
    { id: 'A-1003', title: 'Signal row', subtitle: 'Rows are added through signal state', status: 'visible' }
  ]);

  readonly speedLabel = computed(() => this.slowMode() ? 'Slow / visible' : 'Normal');

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
