import { computed, signal } from '@ariana-framework/core';
import { formControl } from '@ariana-framework/forms';
import { createQueryClient } from '@ariana-framework/query';
import { createRouter } from '@ariana-framework/router';

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

class TodoPage {}

const todos = signal<Todo[]>([
  { id: 1, title: 'Publish Ariana', done: true },
  { id: 2, title: 'Stabilize install smoke tests', done: false }
]);

const remaining = computed(() => todos().filter(todo => !todo.done).length);
const title = formControl('Write first real example');
const query = createQueryClient(() => 1);
const router = createRouter([{ path: '/', component: TodoPage }]);

query.set('todos', todos());

if (!router.match('/')) throw new Error('Router failed in todo example.');
if (remaining() !== 1) throw new Error('Computed remaining count failed.');
if (title.value() !== 'Write first real example') throw new Error('Form control failed.');
if (query.get<Todo[]>('todos')?.data()?.length !== 2) throw new Error('Query cache failed.');

console.log('Ariana todo example typecheck fixture is valid.');
