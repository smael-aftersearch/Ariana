import { bootstrapApplication, Component } from '../../packages/core/dist/index.js';
import { test, equal } from './test-api.mjs';

test('bootstrapApplication returns destroyable ref and runs lifecycle hooks', () => {
  const host = document.createElement('div');
  let init = 0;
  let afterRender = 0;
  let destroy = 0;

  class LifePage {
    onInit() { init++; }
    afterRender() { afterRender++; }
    onDestroy() { destroy++; }
  }
  Component({ selector: 'life-page', template: '<p>Life</p>' })(LifePage);

  const ref = bootstrapApplication(LifePage, host);
  equal(init, 1);
  equal(afterRender, 1);
  equal(destroy, 0);
  ref.cleanupScope.add(() => { destroy++; });
  ref.destroy();
  equal(destroy, 2);
});
