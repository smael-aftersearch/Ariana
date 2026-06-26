import { computed, signal } from '@ariana-framework/core';
import { CounterFixtureComponent } from './counter.component';

const count = signal(1);
const double = computed(() => count() * 2);

const app = document.querySelector('#app');
if (!app) throw new Error('Missing app root.');

app.textContent = `Ariana Vite Fixture: ${double()} - ${CounterFixtureComponent.name}`;
