import { bootstrap, provide } from '@ariana/core';
import { createQueryClient } from '@ariana/query';
import { AdminPanelPage } from './admin-panel.page.js';
import { ADMIN_QUERY_CLIENT } from './app-tokens.js';
import { AdminApiService } from './services/admin-api.service.js';
import { AuthService } from './services/auth.service.js';
import { I18nService } from './services/i18n.service.js';

bootstrap(AdminPanelPage, '#app', {
  providers: [
    AdminApiService,
    AuthService,
    I18nService,
    provide(ADMIN_QUERY_CLIENT, { useFactory: () => createQueryClient() })
  ]
});
