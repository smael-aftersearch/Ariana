import { Component, Route, computed, signal } from '@ariana/core';

@Route('/counter')
@Component({
  selector: 'ari-counter-page',
  templateUrl: './counter.page.html',
  styleUrl: './counter.page.css'
})
export class CounterPage {
  readonly count = signal(0);
  readonly step = signal(1);
  readonly showDetails = signal(true);

  readonly double = computed(() => this.count() * 2);
  readonly status = computed(() => this.count() >= 10 ? 'High' : 'Normal');

  increment() {
    this.count.update(value => value + this.step());
  }

  decrement() {
    this.count.update(value => value - this.step());
  }

  reset() {
    this.count.set(0);
  }

  changeStep(value: string) {
    const parsed = Number(value);
    this.step.set(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }

  toggleDetails() {
    this.showDetails.update(value => !value);
  }
}
