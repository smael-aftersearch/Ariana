import { Component, Route, computed, signal } from '@ariana/core';

type Section = 'dashboard' | 'users' | 'roles' | 'products' | 'reports' | 'settings';
type ModalType = 'user' | 'role' | 'product' | 'report' | 'order' | 'note';

type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: 'purple' | 'green' | 'orange' | 'blue';
};

type UserRow = {
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
};

type ProductRow = {
  name: string;
  category: string;
  inventory: number;
  revenue: string;
};

type ActivityItem = {
  title: string;
  meta: string;
  tone: 'success' | 'info' | 'warning';
};

type ReportItem = {
  name: string;
  owner: string;
  state: string;
  progress: number;
};

@Route('/admin')
@Component({
  selector: 'ari-admin-panel-page',
  templateUrl: './admin-panel.page.html',
  styleUrl: './admin-panel.page.css'
})
export class AdminPanelPage {
  readonly activeSection = signal<Section>('dashboard');
  readonly activeModal = signal<ModalType | undefined>(undefined);
  readonly search = signal('');
  readonly sidebarOpen = signal(true);
  readonly compactMode = signal(false);
  readonly quickNote = signal('');
  readonly selectedPlan = signal('Growth');

  readonly metrics = signal<Metric[]>([
    { label: 'Total Revenue', value: '$128.4K', delta: '+18.2%', tone: 'purple' },
    { label: 'Active Users', value: '24,860', delta: '+9.8%', tone: 'green' },
    { label: 'Open Orders', value: '1,482', delta: '+4.1%', tone: 'blue' },
    { label: 'Platform Score', value: '98%', delta: '+6 gates', tone: 'orange' }
  ]);

  readonly users = signal<UserRow[]>([
    { name: 'Ava Thompson', email: 'ava@ariana.dev', role: 'Owner', status: 'Active', joined: 'Today' },
    { name: 'Daniel Lee', email: 'daniel@ariana.dev', role: 'Manager', status: 'Active', joined: 'Yesterday' },
    { name: 'Mina Stone', email: 'mina@ariana.dev', role: 'Analyst', status: 'Invited', joined: 'Jun 24' },
    { name: 'Owen Clark', email: 'owen@ariana.dev', role: 'Support', status: 'Paused', joined: 'Jun 20' }
  ]);

  readonly products = signal<ProductRow[]>([
    { name: 'Ariana Pro', category: 'Subscription', inventory: 1200, revenue: '$48.2K' },
    { name: 'Admin Kit', category: 'Template', inventory: 420, revenue: '$19.4K' },
    { name: 'Release Pack', category: 'Add-on', inventory: 310, revenue: '$12.8K' }
  ]);

  readonly activities = signal<ActivityItem[]>([
    { title: 'Order completed', meta: 'Checkout flow finished by customer #4821', tone: 'success' },
    { title: 'User registered', meta: 'New manager invited to the workspace', tone: 'info' },
    { title: 'Report exported', meta: 'Monthly revenue report generated as CSV', tone: 'success' },
    { title: 'Release gate passed', meta: 'Audit completed with zero findings', tone: 'warning' }
  ]);

  readonly reports = signal<ReportItem[]>([
    { name: 'Revenue Summary', owner: 'Finance', state: 'Ready', progress: 100 },
    { name: 'User Growth', owner: 'Marketing', state: 'Scheduled', progress: 74 },
    { name: 'Release Review', owner: 'Platform', state: 'Ready', progress: 100 }
  ]);

  readonly visibleUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) return this.users();
    return this.users().filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query)
    );
  });

  readonly activeSectionTitle = computed(() => {
    const titles: Record<Section, string> = {
      dashboard: 'Executive Dashboard',
      users: 'User Management',
      roles: 'Roles & Permissions',
      products: 'Product Operations',
      reports: 'Reports Center',
      settings: 'Workspace Settings'
    };
    return titles[this.activeSection()];
  });

  readonly completionRate = computed(() => {
    const ready = this.reports().filter(report => report.state === 'Ready').length;
    return `${Math.round((ready / this.reports().length) * 100)}%`;
  });

  readonly modalTitle = computed(() => {
    const modal = this.activeModal();
    const titles: Record<ModalType, string> = {
      user: 'Add User',
      role: 'Add Role',
      product: 'Add Product',
      report: 'Add Report',
      order: 'Add Order',
      note: 'Add Note'
    };
    return modal ? titles[modal] : '';
  });

  setSection(section: Section) {
    this.activeSection.set(section);
  }

  openModal(type: ModalType) {
    this.activeModal.set(type);
  }

  closeModal() {
    this.activeModal.set(undefined);
  }

  changeSearch(value: string) {
    this.search.set(value);
  }

  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
  }

  toggleCompactMode() {
    this.compactMode.update(value => !value);
  }

  updateQuickNote(value: string) {
    this.quickNote.set(value);
  }

  setPlan(value: string) {
    this.selectedPlan.set(value);
  }

  saveModal() {
    const modal = this.activeModal();
    if (modal === 'note' && this.quickNote().trim()) {
      this.activities.update(items => [
        { title: 'Note added', meta: this.quickNote().trim(), tone: 'info' },
        ...items
      ]);
      this.quickNote.set('');
    }
    this.closeModal();
  }
}
