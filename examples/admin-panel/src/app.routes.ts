import type { LazyRouteDefinition } from '@ariana/router';

export type AdminRouteKey = 'dashboard' | 'analytics' | 'users' | 'roles' | 'products' | 'orders' | 'reports' | 'calendar' | 'settings';

export const adminRoutes: readonly LazyRouteDefinition[] = [
  { path: '/', title: 'Dashboard', data: { key: 'dashboard', query: 'dashboard' }, loadComponent: () => import('./pages/dashboard.page.js').then(module => module.DashboardPage) },
  { path: '/analytics', title: 'Analytics', data: { key: 'analytics', query: 'dashboard' }, loadComponent: () => import('./pages/analytics.page.js').then(module => module.AnalyticsPage) },
  { path: '/users', title: 'Users', data: { key: 'users', query: 'users' }, loadComponent: () => import('./pages/users.page.js').then(module => module.UsersPage) },
  { path: '/roles', title: 'Roles', data: { key: 'roles', query: 'roles' }, loadComponent: () => import('./pages/roles.page.js').then(module => module.RolesPage) },
  { path: '/products', title: 'Products', data: { key: 'products', query: 'products' }, loadComponent: () => import('./pages/products.page.js').then(module => module.ProductsPage) },
  { path: '/orders', title: 'Orders', data: { key: 'orders', query: 'orders' }, loadComponent: () => import('./pages/orders.page.js').then(module => module.OrdersPage) },
  { path: '/reports', title: 'Reports', data: { key: 'reports', query: 'reports' }, loadComponent: () => import('./pages/reports.page.js').then(module => module.ReportsPage) },
  { path: '/calendar', title: 'Calendar', data: { key: 'calendar', query: 'dashboard' }, loadComponent: () => import('./pages/calendar.page.js').then(module => module.CalendarPage) },
  { path: '/settings', title: 'Settings', data: { key: 'settings', query: 'settings' }, loadComponent: () => import('./pages/settings.page.js').then(module => module.SettingsPage) }
];
