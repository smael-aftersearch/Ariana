import { bootstrap, provide } from '@ariana/core';
import { createQueryClient } from '@ariana/query';
import { AdminPanelPage } from './admin-panel.page.js';
import { AdminAnimationLabPage } from './animation-lab.page.js';
import { AnimatePage } from './animate.page.js';
import { RouteOutletDemoPage } from './route-outlet-demo.page.js';
import { ADMIN_QUERY_CLIENT } from './app-tokens.js';
import { AdminApiService } from './services/admin-api.service.js';
import { AuthService } from './services/auth.service.js';
import { I18nService } from './services/i18n.service.js';
import './admin-panel.extra.css';
import './admin-animations.scss';

const providers = [
  AdminApiService,
  AuthService,
  I18nService,
  provide(ADMIN_QUERY_CLIENT, { useFactory: () => createQueryClient() })
];

const params = new URLSearchParams(window.location.search);
const path = window.location.pathname.replace(/\/$/, '');

if (path === '/animate' || params.get('page') === 'animate') {
  bootstrap(AnimatePage, '#app', { providers });
} else if (path === '/route-outlet' || params.get('page') === 'route-outlet') {
  bootstrap(RouteOutletDemoPage, '#app', { providers });
} else if (params.get('lab') === 'animation') {
  bootstrap(AdminAnimationLabPage, '#app', { providers });
} else {
  bootstrap(AdminPanelPage, '#app', { providers });
}
