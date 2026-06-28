import { Component, Route, computed, inject, signal } from '@ariana/core';
import { createRouter } from '@ariana/router';
import type { RouteDefinition } from '@ariana/router';
import type { QueryClient } from '@ariana/query';
import { ADMIN_QUERY_CLIENT } from './app-tokens.js';
import { adminRoutes, type AdminRouteKey } from './app.routes.js';
import { AdminApiService } from './services/admin-api.service.js';
import type { DashboardData, OrderRow, ProductRow, ReportItem, RoleCard, UserRow } from './services/admin-api.service.js';
import { AuthService } from './services/auth.service.js';
import { I18nService } from './services/i18n.service.js';

class RoutePlaceholder {}

type ModalType = 'user' | 'role' | 'product' | 'report' | 'order' | 'note';
type Dropdown = 'notifications' | 'profile' | undefined;
type Accent = 'emerald' | 'indigo' | 'violet' | 'sky' | 'rose' | 'amber' | 'slate';

const routePaths: Record<AdminRouteKey, string> = {
  dashboard: '/', analytics: '/analytics', users: '/users', roles: '/roles', products: '/products', orders: '/orders', reports: '/reports', calendar: '/calendar', settings: '/settings'
};

const router = createRouter(adminRoutes.map(route => ({
  path: route.path,
  title: route.title,
  data: route.data,
  providers: route.providers,
  guards: route.guards,
  component: RoutePlaceholder
})) as readonly RouteDefinition[], '/');

@Route('/admin')
@Component({ selector: 'ari-admin-panel-page', templateUrl: './admin-panel.page.html', styleUrl: './admin-panel.page.css' })
export class AdminPanelPage {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly query = inject<QueryClient>(ADMIN_QUERY_CLIENT);

  readonly loginEmail = signal('admin@ariana.dev');
  readonly loginPassword = signal('demo1234');
  readonly activeRoute = signal<AdminRouteKey>('dashboard');
  readonly activeModal = signal<ModalType | undefined>(undefined);
  readonly activeDropdown = signal<Dropdown>(undefined);
  readonly search = signal('');
  readonly sidebarOpen = signal(true);
  readonly darkMode = signal(false);
  readonly themePanelOpen = signal(false);
  readonly commandOpen = signal(false);
  readonly accent = signal<Accent>('emerald');
  readonly quickNote = signal('');
  readonly selectedPlan = signal('Enterprise');
  readonly selectedRange = signal('Jan 01 - Jan 31, 2026');
  readonly routeLoading = signal(false);
  readonly routeError = signal<string | undefined>(undefined);
  readonly loadedModule = signal('none');
  readonly loadedChunk = signal('none');
  readonly activeQueryKey = signal('dashboard');
  readonly pageIndex = signal(1);
  readonly pageSize = signal(4);

  readonly dashboardData = signal<DashboardData | undefined>(undefined);
  readonly usersData = signal<UserRow[]>([]);
  readonly ordersData = signal<OrderRow[]>([]);
  readonly productsData = signal<ProductRow[]>([]);
  readonly rolesData = signal<RoleCard[]>([]);
  readonly reportsData = signal<ReportItem[]>([]);

  readonly notifications = signal([
    { title: 'New order received', meta: '2 minutes ago', tone: 'success' },
    { title: 'Payment needs review', meta: '1 hour ago', tone: 'warning' },
    { title: 'System backup completed', meta: 'Yesterday', tone: 'info' }
  ]);

  readonly metrics = computed(() => this.dashboardData()?.metrics ?? []);
  readonly chartBars = computed(() => this.dashboardData()?.chartBars ?? []);
  readonly traffic = computed(() => this.dashboardData()?.traffic ?? []);
  readonly activities = computed(() => this.dashboardData()?.activities ?? []);
  readonly users = computed(() => this.usersData());
  readonly orders = computed(() => this.ordersData());
  readonly products = computed(() => this.productsData());
  readonly roles = computed(() => this.rolesData());
  readonly reports = computed(() => this.reportsData());

  readonly isLoggedIn = computed(() => this.auth.isAuthenticated());
  readonly showLogin = computed(() => !this.auth.isAuthenticated());
  readonly authLoading = computed(() => this.auth.loading());
  readonly authError = computed(() => this.auth.error());
  readonly userName = computed(() => this.auth.user()?.name ?? 'Guest');
  readonly userRole = computed(() => this.auth.user()?.role ?? 'Visitor');
  readonly locale = computed(() => this.i18n.locale());
  readonly direction = computed(() => this.i18n.direction());
  readonly queryStatus = computed(() => this.query.get<unknown>(this.activeQueryKey())?.status() ?? 'idle');
  readonly activeTitle = computed(() => this.t(this.activeRoute()));

  readonly hasActiveData = computed(() => {
    const route = this.activeRoute();
    if (route === 'users') return this.usersData().length > 0;
    if (route === 'orders') return this.ordersData().length > 0;
    if (route === 'products') return this.productsData().length > 0;
    if (route === 'roles') return this.rolesData().length > 0;
    if (route === 'reports') return this.reportsData().length > 0;
    return this.dashboardData() !== undefined;
  });

  readonly showPageLoader = computed(() => (this.routeLoading() || this.queryStatus() === 'loading') && !this.hasActiveData());

  readonly visibleUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) return this.usersData();
    return this.usersData().filter(user =>
      user.id.toLowerCase().includes(query) || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.role.toLowerCase().includes(query) || user.department.toLowerCase().includes(query) || user.status.toLowerCase().includes(query)
    );
  });

  readonly tableSource = computed(() => {
    const route = this.activeRoute();
    if (route === 'users') return this.visibleUsers();
    if (route === 'orders') return this.ordersData();
    if (route === 'products') return this.productsData();
    if (route === 'roles') return this.rolesData();
    if (route === 'reports') return this.reportsData();
    return [];
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.tableSource().length / this.pageSize())));
  readonly pageSummary = computed(() => `${this.pageIndex()} / ${this.totalPages()} · ${this.tableSource().length} rows`);
  readonly pagedUsers = computed(() => paginate(this.visibleUsers(), this.pageIndex(), this.pageSize()));
  readonly pagedOrders = computed(() => paginate(this.ordersData(), this.pageIndex(), this.pageSize()));
  readonly pagedProducts = computed(() => paginate(this.productsData(), this.pageIndex(), this.pageSize()));
  readonly pagedRoles = computed(() => paginate(this.rolesData(), this.pageIndex(), this.pageSize()));
  readonly pagedReports = computed(() => paginate(this.reportsData(), this.pageIndex(), this.pageSize()));

  readonly completionRate = computed(() => {
    const reports = this.reportsData();
    if (reports.length === 0) return '0%';
    const ready = reports.filter(report => report.state === 'Ready').length;
    return `${Math.round((ready / reports.length) * 100)}%`;
  });

  readonly modalTitle = computed(() => {
    const modal = this.activeModal();
    const titles: Record<ModalType, string> = { user: 'addUser', role: 'addRole', product: 'addProduct', report: 'addReport', order: 'addOrder', note: 'addNote' };
    return modal ? this.t(titles[modal]) : '';
  });

  t(key: string) { return this.i18n.t(key); }
  setLoginEmail(value: string) { this.loginEmail.set(value); }
  setLoginPassword(value: string) { this.loginPassword.set(value); }
  toggleLanguage() { this.i18n.toggle(); }
  toggleSidebar() { this.sidebarOpen.update(value => !value); }
  toggleDarkMode() { this.darkMode.update(value => !value); }
  toggleThemePanel() { this.themePanelOpen.update(value => !value); this.activeDropdown.set(undefined); }
  setAccent(value: Accent) { this.accent.set(value); }
  toggleCommand() { this.commandOpen.update(value => !value); this.activeDropdown.set(undefined); }
  closeCommand() { this.commandOpen.set(false); }
  updateQuickNote(value: string) { this.quickNote.set(value); }
  setPlan(value: string) { this.selectedPlan.set(value); }
  setRange(value: string) { this.selectedRange.set(value); }
  changeSearch(value: string) { this.search.set(value); this.pageIndex.set(1); }
  openModal(type: ModalType) { this.activeModal.set(type); this.activeDropdown.set(undefined); }
  closeModal() { this.activeModal.set(undefined); }
  closeDropdown() { this.activeDropdown.set(undefined); }

  nextPage() { this.pageIndex.update(value => Math.min(this.totalPages(), value + 1)); }
  previousPage() { this.pageIndex.update(value => Math.max(1, value - 1)); }
  setPageSize(value: string) { this.pageSize.set(Number(value)); this.pageIndex.set(1); }

  toggleDropdown(name: Exclude<Dropdown, undefined>) {
    this.themePanelOpen.set(false);
    this.activeDropdown.update(current => current === name ? undefined : name);
  }

  async login() {
    const ok = await this.auth.login(this.loginEmail(), this.loginPassword());
    if (ok) await this.navigate('dashboard');
  }

  async loginDemo() {
    const ok = await this.auth.loginDemo();
    if (ok) await this.navigate('dashboard');
  }

  logout() {
    this.auth.logout();
    this.activeDropdown.set(undefined);
    this.dashboardData.set(undefined);
    this.usersData.set([]);
    this.ordersData.set([]);
    this.productsData.set([]);
    this.rolesData.set([]);
    this.reportsData.set([]);
  }

  async navigate(route: AdminRouteKey) {
    if (!this.auth.isAuthenticated()) return;
    this.routeError.set(undefined);
    this.routeLoading.set(true);
    this.activeDropdown.set(undefined);
    this.themePanelOpen.set(false);
    this.commandOpen.set(false);
    this.pageIndex.set(1);

    try {
      const routeDefinition = adminRoutes.find(item => item.data?.key === route);
      if (!routeDefinition) throw new Error(`Missing route ${route}`);
      const loaded = await routeDefinition.loadComponent();
      this.loadedModule.set(loaded.name);
      this.loadedChunk.set(String(routeDefinition.data?.chunk ?? 'unknown chunk'));
      await router.navigate(routePaths[route]);
      this.activeRoute.set(route);
      this.activeQueryKey.set(String(routeDefinition.data?.query ?? route));
      await this.loadRouteData(routeDefinition.data?.query as string | undefined);
    } catch (error) {
      this.routeError.set(error instanceof Error ? error.message : 'Route failed');
    } finally {
      this.routeLoading.set(false);
    }
  }

  async reload() { await this.loadRouteData(this.activeQueryKey(), true); }

  async loadRouteData(queryKey = 'dashboard', force = false) {
    if (queryKey === 'users') { const data = await this.query.fetch('users', () => this.api.users(), { staleTime: 15000, force }); this.usersData.set(data); return; }
    if (queryKey === 'orders') { const data = await this.query.fetch('orders', () => this.api.orders(), { staleTime: 15000, force }); this.ordersData.set(data); return; }
    if (queryKey === 'products') { const data = await this.query.fetch('products', () => this.api.products(), { staleTime: 15000, force }); this.productsData.set(data); return; }
    if (queryKey === 'roles') { const data = await this.query.fetch('roles', () => this.api.roles(), { staleTime: 15000, force }); this.rolesData.set(data); return; }
    if (queryKey === 'reports') { const data = await this.query.fetch('reports', () => this.api.reports(), { staleTime: 15000, force }); this.reportsData.set(data); return; }
    const data = await this.query.fetch('dashboard', () => this.api.dashboard(), { staleTime: 15000, force });
    this.dashboardData.set(data);
  }

  async saveModal() {
    if (this.activeModal() === 'note' && this.quickNote().trim()) {
      const current = this.dashboardData();
      if (current) this.dashboardData.set({ ...current, activities: [{ title: 'Note added', meta: this.quickNote().trim(), tone: 'info' }, ...current.activities] });
      this.quickNote.set('');
    }
    this.closeModal();
  }
}

function paginate<T>(items: readonly T[], page: number, size: number): T[] {
  return items.slice((page - 1) * size, page * size);
}
