import { Component, computed, signal } from '@ariana-framework/core';

@Component({
  selector: 'ari-counter-fixture',
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.css'
})
export class CounterFixtureComponent {
  readonly count = signal(1);
  readonly double = computed(() => this.count() * 2);

  increment() {
    this.count.update(value => value + 1);
  }
}
