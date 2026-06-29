import type { LazyRouteDefinition, RouteTransition } from '@ariana/router';

export type AdminRouteKey = 'dashboard' | 'analytics' | 'users' | 'roles' | 'products' | 'orders' | 'reports' | 'calendar' | 'settings';

const adminRouteTransition: RouteTransition = {
  enter: 'admin-route-enter admin-route-rise',
  leave: 'admin-route-leave admin-route-drop'
};

export const adminRoutes: readonly LazyRouteDefinition[] = [
  { path: '/', title: 'Dashboard', transition: adminRouteTransition, data: { key: 'dashboard', query: 'dashboard', chunk: 'dashboard.page-[hash].js' }, loadComponent: () => import('./pages/dashboard.page.js').then(module => module.DashboardPage) },
  { path: '/analytics', title: 'Analytics', transition: adminRouteTransition, data: { key: 'analytics', query: 'dashboard', chunk: 'analytics.page-[hash].js' }, loadComponent: () => import('./pages/analytics.page.js').then(module => module.AnalyticsPage) },
  { path: '/users', title: 'Users', transition: adminRouteTransition, data: { key: 'users', query: 'users', chunk: 'users.page-[hash].js' }, loadComponent: () => import('./pages/users.page.js').then(module => module.UsersPage) },
  { path: '/roles', title: 'Roles', transition: adminRouteTransition, data: { key: 'roles', query: 'roles', chunk: 'roles.page-[hash].js' }, loadComponent: () => import('./pages/roles.page.js').then(module => module.RolesPage) },
  { path: '/products', title: 'Products', transition: adminRouteTransition, data: { key: 'products', query: 'products', chunk: 'products.page-[hash].js' }, loadComponent: () => import('./pages/products.page.js').then(module => module.ProductsPage) },
  { path: '/orders', title: 'Orders', transition: adminRouteTransition, data: { key: 'orders', query: 'orders', chunk: 'orders.page-[hash].js' }, loadComponent: () => import('./pages/orders.page.js').then(module => module.OrdersPage) },
  { path: '/reports', title: 'Reports', transition: adminRouteTransition, data: { key: 'reports', query: 'reports', chunk: 'reports.page-[hash].js' }, loadComponent: () => import('./pages/reports.page.js').then(module => module.ReportsPage) },
  { path: '/calendar', title: 'Calendar', transition: adminRouteTransition, data: { key: 'calendar', query: 'dashboard', chunk: 'calendar.page-[hash].js' }, loadComponent: () => import('./pages/calendar.page.js').then(module => module.CalendarPage) },
  { path: '/settings', title: 'Settings', transition: adminRouteTransition, data: { key: 'settings', query: 'settings', chunk: 'settings.page-[hash].js' }, loadComponent: () => import('./pages/settings.page.js').then(module => module.SettingsPage) }
];
