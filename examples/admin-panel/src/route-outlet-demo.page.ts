import { Component, Route, signal } from '@ariana/core';
import { createRouter, createRouterOutlet, type RouteDefinition } from '@ariana/router';

@Component({ selector: 'ari-outlet-alpha-page', templateUrl: './route-outlet-alpha.page.html', styleUrl: './route-outlet-demo.page.scss' })
class OutletAlphaPage {}

@Component({ selector: 'ari-outlet-beta-page', templateUrl: './route-outlet-beta.page.html', styleUrl: './route-outlet-demo.page.scss' })
class OutletBetaPage {}

@Component({ selector: 'ari-outlet-gamma-page', templateUrl: './route-outlet-gamma.page.html', styleUrl: './route-outlet-demo.page.scss' })
class OutletGammaPage {}

const transition = {
  enter: 'admin-route-enter admin-route-rise',
  leave: 'admin-route-leave admin-route-drop'
};

const routes: readonly RouteDefinition[] = [
  { path: '/', title: 'Alpha', component: OutletAlphaPage, transition, data: { key: 'alpha' } },
  { path: '/beta', title: 'Beta', component: OutletBetaPage, transition, data: { key: 'beta' } },
  { path: '/gamma', title: 'Gamma', component: OutletGammaPage, transition, data: { key: 'gamma' } }
];

@Route('/route-outlet')
@Component({ selector: 'ari-route-outlet-demo-page', templateUrl: './route-outlet-demo.page.html', styleUrl: './route-outlet-demo.page.scss' })
export class RouteOutletDemoPage {
  readonly currentPath = signal('/');
  readonly status = signal('idle');
  private readonly router = createRouter(routes, '/');
  private outlet?: ReturnType<typeof createRouterOutlet>;

  mountOutlet() {
    if (!this.outlet) this.outlet = createRouterOutlet(this.router, '#router-outlet-demo-host', { wrapperClass: 'outlet-view' });
    void this.renderOutlet();
  }

  async navigate(path: string) {
    this.status.set('navigating');
    const ok = await this.router.navigate(path);
    if (ok) {
      this.currentPath.set(path);
      await this.renderOutlet();
      this.status.set(`rendered ${path}`);
      return;
    }
    this.status.set(`route not found: ${path}`);
  }

  async renderOutlet() {
    if (!this.outlet) return;
    await this.outlet.render();
  }

  destroyOutlet() {
    this.outlet?.destroy();
    this.outlet = undefined;
    this.status.set('destroyed');
  }
}
