import { Component, Route, computed, signal } from '@ariana/core';

type Section = 'dashboard' | 'analytics' | 'users' | 'roles' | 'products' | 'orders' | 'reports' | 'calendar' | 'settings';
type ModalType = 'user' | 'role' | 'product' | 'report' | 'order' | 'note';
type Dropdown = 'notifications' | 'profile' | undefined;
type Accent = 'emerald' | 'indigo' | 'violet' | 'sky' | 'rose' | 'amber' | 'slate';

type NavItem = { section: Section; label: string; badge?: string };
type NavGroup = { title: string; items: NavItem[] };
type Metric = { label: string; value: string; delta: string; trend: 'up' | 'down'; icon: string };
type ChartBar = { label: string; value: string; size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' };
type UserRow = { id: string; name: string; email: string; role: string; department: string; status: string; lastLogin: string };
type OrderRow = { id: string; customer: string; channel: string; total: string; payment: string; state: string };
type ProductRow = { sku: string; name: string; category: string; stock: number; revenue: string; state: string };
type RoleCard = { name: string; description: string; permissions: string; users: string; tone: 'accent' | 'purple' | 'warning' };
type ActivityItem = { title: string; meta: string; tone: 'success' | 'info' | 'warning' };
type ReportItem = { name: string; owner: string; state: string; progress: string; bar: 'full' | 'high' | 'mid' };
type NotificationItem = { title: string; meta: string; tone: 'success' | 'info' | 'warning' };

@Route('/admin')
@Component({
  selector: 'ari-admin-panel-page',
  templateUrl: './admin-panel.page.html',
  styleUrl: './admin-panel.page.css'
})
export class AdminPanelPage {
  readonly activeSection = signal<Section>('dashboard');
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

  readonly navGroups = signal<NavGroup[]>([
    { title: 'Main', items: [{ section: 'dashboard', label: 'Dashboard' }, { section: 'analytics', label: 'Analytics' }] },
    { title: 'Management', items: [{ section: 'users', label: 'Users', badge: '12' }, { section: 'roles', label: 'Roles' }, { section: 'products', label: 'Products' }, { section: 'orders', label: 'Orders', badge: '8' }] },
    { title: 'Workspace', items: [{ section: 'reports', label: 'Reports' }, { section: 'calendar', label: 'Calendar' }, { section: 'settings', label: 'Settings' }] }
  ]);

  readonly metrics = signal<Metric[]>([
    { label: 'Revenue', value: '$84,254', delta: '12% vs last month', trend: 'up', icon: '◇' },
    { label: 'Orders', value: '3,845', delta: '8% vs last month', trend: 'up', icon: '◎' },
    { label: 'Users', value: '1,205', delta: '24% vs last month', trend: 'up', icon: '◌' },
    { label: 'Errors', value: '14', delta: '2% vs last month', trend: 'down', icon: '△' }
  ]);

  readonly chartBars = signal<ChartBar[]>([
    { label: 'Jan', value: '$42K', size: 'md' },
    { label: 'Feb', value: '$51K', size: 'lg' },
    { label: 'Mar', value: '$48K', size: 'sm' },
    { label: 'Apr', value: '$64K', size: 'xl' },
    { label: 'May', value: '$58K', size: 'lg' },
    { label: 'Jun', value: '$76K', size: 'xl' },
    { label: 'Jul', value: '$69K', size: 'md' }
  ]);

  readonly traffic = signal([
    { label: 'Direct', value: '42%', tone: 'accent' },
    { label: 'Organic', value: '26%', tone: 'blue' },
    { label: 'Referral', value: '18%', tone: 'warning' },
    { label: 'Social', value: '14%', tone: 'purple' }
  ]);

  readonly users = signal<UserRow[]>([
    { id: 'USR-1001', name: 'Alex Morgan', email: 'alex@itsurge.dev', role: 'Owner', department: 'Platform', status: 'Active', lastLogin: 'Today' },
    { id: 'USR-1002', name: 'Sara Kim', email: 'sara@itsurge.dev', role: 'Manager', department: 'Sales', status: 'Active', lastLogin: 'Yesterday' },
    { id: 'USR-1003', name: 'Mina Stone', email: 'mina@itsurge.dev', role: 'Analyst', department: 'Finance', status: 'Invited', lastLogin: 'Jun 24' },
    { id: 'USR-1004', name: 'Owen Clark', email: 'owen@itsurge.dev', role: 'Support', department: 'Success', status: 'Paused', lastLogin: 'Jun 20' }
  ]);

  readonly orders = signal<OrderRow[]>([
    { id: '#ORD-2048', customer: 'Sara Kim', channel: 'Storefront', total: '$1,299', payment: 'Paid', state: 'Packing' },
    { id: '#ORD-2049', customer: 'Daniel Lee', channel: 'Partner', total: '$842', payment: 'Pending', state: 'Review' },
    { id: '#ORD-2050', customer: 'Ava Thompson', channel: 'Direct', total: '$2,180', payment: 'Paid', state: 'Delivered' },
    { id: '#ORD-2051', customer: 'Owen Clark', channel: 'Marketplace', total: '$540', payment: 'Refund', state: 'Hold' }
  ]);

  readonly products = signal<ProductRow[]>([
    { sku: 'PRD-110', name: 'Ariana Pro', category: 'Subscription', stock: 1200, revenue: '$48.2K', state: 'Active' },
    { sku: 'PRD-220', name: 'Admin Kit', category: 'Template', stock: 420, revenue: '$19.4K', state: 'Active' },
    { sku: 'PRD-310', name: 'Release Pack', category: 'Add-on', stock: 310, revenue: '$12.8K', state: 'Draft' }
  ]);

  readonly roles = signal<RoleCard[]>([
    { name: 'Owner', description: 'Full workspace ownership with billing and release actions.', permissions: '42', users: '3', tone: 'accent' },
    { name: 'Manager', description: 'Operational access for users, orders, reports, and products.', permissions: '31', users: '8', tone: 'purple' },
    { name: 'Analyst', description: 'Read-only reporting access with export and dashboard views.', permissions: '18', users: '12', tone: 'warning' }
  ]);

  readonly activities = signal<ActivityItem[]>([
    { title: 'Order completed', meta: 'Checkout flow finished by customer #4821', tone: 'success' },
    { title: 'User registered', meta: 'New manager invited to the workspace', tone: 'info' },
    { title: 'Report exported', meta: 'Monthly revenue report generated as CSV', tone: 'success' },
    { title: 'Release gate passed', meta: 'Audit completed with zero findings', tone: 'warning' }
  ]);

  readonly reports = signal<ReportItem[]>([
    { name: 'Revenue Summary', owner: 'Finance', state: 'Ready', progress: '100%', bar: 'full' },
    { name: 'User Growth', owner: 'Marketing', state: 'Scheduled', progress: '74%', bar: 'high' },
    { name: 'Release Review', owner: 'Platform', state: 'Ready', progress: '100%', bar: 'full' },
    { name: 'Inventory Health', owner: 'Operations', state: 'Draft', progress: '45%', bar: 'mid' }
  ]);

  readonly notifications = signal<NotificationItem[]>([
    { title: 'New order received', meta: '2 minutes ago', tone: 'success' },
    { title: 'Payment needs review', meta: '1 hour ago', tone: 'warning' },
    { title: 'System backup completed', meta: 'Yesterday', tone: 'info' }
  ]);

  readonly visibleUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(user =>
      user.id.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  });

  readonly activeSectionTitle = computed(() => {
    const titles: Record<Section, string> = {
      dashboard: 'Dashboard', analytics: 'Analytics', users: 'Users', roles: 'Roles & Permissions', products: 'Products', orders: 'Orders', reports: 'Reports', calendar: 'Calendar', settings: 'Settings'
    };
    return titles[this.activeSection()];
  });

  readonly completionRate = computed(() => {
    const ready = this.reports().filter(report => report.state === 'Ready').length;
    return `${Math.round((ready / this.reports().length) * 100)}%`;
  });

  readonly modalTitle = computed(() => {
    const modal = this.activeModal();
    const titles: Record<ModalType, string> = { user: 'Add User', role: 'Add Role', product: 'Add Product', report: 'Create Report', order: 'Create Order', note: 'Add Note' };
    return modal ? titles[modal] : '';
  });

  readonly shellClass = computed(() => `${this.darkMode() ? 'dark ' : ''}accent-${this.accent()}`);

  setSection(section: Section) { this.activeSection.set(section); }
  openModal(type: ModalType) { this.activeModal.set(type); this.activeDropdown.set(undefined); }
  closeModal() { this.activeModal.set(undefined); }
  changeSearch(value: string) { this.search.set(value); }
  toggleSidebar() { this.sidebarOpen.update(value => !value); }
  toggleDarkMode() { this.darkMode.update(value => !value); }
  toggleThemePanel() { this.themePanelOpen.update(value => !value); this.activeDropdown.set(undefined); }
  setAccent(value: Accent) { this.accent.set(value); }
  toggleCommand() { this.commandOpen.update(value => !value); this.activeDropdown.set(undefined); }
  closeCommand() { this.commandOpen.set(false); }
  updateQuickNote(value: string) { this.quickNote.set(value); }
  setPlan(value: string) { this.selectedPlan.set(value); }
  setRange(value: string) { this.selectedRange.set(value); }

  toggleDropdown(name: Exclude<Dropdown, undefined>) {
    this.themePanelOpen.set(false);
    this.activeDropdown.update(current => current === name ? undefined : name);
  }

  closeDropdown() { this.activeDropdown.set(undefined); }

  saveModal() {
    const modal = this.activeModal();
    if (modal === 'note' && this.quickNote().trim()) {
      this.activities.update(items => [{ title: 'Note added', meta: this.quickNote().trim(), tone: 'info' }, ...items]);
      this.quickNote.set('');
    }
    this.closeModal();
  }
}
