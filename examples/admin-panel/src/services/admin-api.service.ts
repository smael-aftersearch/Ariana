export type DashboardData = {
  metrics: Array<{ label: string; value: string; delta: string; trend: 'up' | 'down'; icon: string }>;
  chartBars: Array<{ label: string; value: string; size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }>;
  traffic: Array<{ label: string; value: string; tone: string }>;
  activities: Array<{ title: string; meta: string; tone: 'success' | 'info' | 'warning' }>;
};

export type UserRow = { id: string; name: string; email: string; role: string; department: string; status: string; lastLogin: string };
export type OrderRow = { id: string; customer: string; channel: string; total: string; payment: string; state: string };
export type ProductRow = { sku: string; name: string; category: string; stock: number; revenue: string; state: string };
export type RoleCard = { name: string; description: string; permissions: string; users: string; tone: 'accent' | 'purple' | 'warning' };
export type ReportItem = { name: string; owner: string; state: string; progress: string; bar: 'full' | 'high' | 'mid' };

export class AdminApiService {
  async dashboard(): Promise<DashboardData> {
    await delay(520);
    return {
      metrics: [
        { label: 'revenue', value: '$84,254', delta: '12% vs last month', trend: 'up', icon: '◇' },
        { label: 'openOrders', value: '3,845', delta: '8% vs last month', trend: 'up', icon: '◎' },
        { label: 'activeUsers', value: '1,205', delta: '24% vs last month', trend: 'up', icon: '◌' },
        { label: 'releaseScore', value: '98%', delta: '6 gates passed', trend: 'up', icon: '△' }
      ],
      chartBars: [
        { label: 'Jan', value: '$42K', size: 'md' }, { label: 'Feb', value: '$51K', size: 'lg' }, { label: 'Mar', value: '$48K', size: 'sm' },
        { label: 'Apr', value: '$64K', size: 'xl' }, { label: 'May', value: '$58K', size: 'lg' }, { label: 'Jun', value: '$76K', size: 'xl' }, { label: 'Jul', value: '$69K', size: 'md' }
      ],
      traffic: [
        { label: 'Direct', value: '42%', tone: 'accent' }, { label: 'Organic', value: '26%', tone: 'blue' },
        { label: 'Referral', value: '18%', tone: 'warning' }, { label: 'Social', value: '14%', tone: 'purple' }
      ],
      activities: [
        { title: 'Order completed', meta: 'Checkout flow finished by customer #4821', tone: 'success' },
        { title: 'User registered', meta: 'New manager invited to the workspace', tone: 'info' },
        { title: 'Report exported', meta: 'Monthly revenue report generated as CSV', tone: 'success' },
        { title: 'Release gate passed', meta: 'Audit completed with zero findings', tone: 'warning' }
      ]
    };
  }

  async users(): Promise<UserRow[]> {
    await delay(620);
    return [
      { id: 'USR-1001', name: 'Alex Morgan', email: 'alex@itsurge.dev', role: 'Owner', department: 'Platform', status: 'Active', lastLogin: 'Today' },
      { id: 'USR-1002', name: 'Sara Kim', email: 'sara@itsurge.dev', role: 'Manager', department: 'Sales', status: 'Active', lastLogin: 'Yesterday' },
      { id: 'USR-1003', name: 'Mina Stone', email: 'mina@itsurge.dev', role: 'Analyst', department: 'Finance', status: 'Invited', lastLogin: 'Jun 24' },
      { id: 'USR-1004', name: 'Owen Clark', email: 'owen@itsurge.dev', role: 'Support', department: 'Success', status: 'Paused', lastLogin: 'Jun 20' }
    ];
  }

  async orders(): Promise<OrderRow[]> {
    await delay(580);
    return [
      { id: '#ORD-2048', customer: 'Sara Kim', channel: 'Storefront', total: '$1,299', payment: 'Paid', state: 'Packing' },
      { id: '#ORD-2049', customer: 'Daniel Lee', channel: 'Partner', total: '$842', payment: 'Pending', state: 'Review' },
      { id: '#ORD-2050', customer: 'Ava Thompson', channel: 'Direct', total: '$2,180', payment: 'Paid', state: 'Delivered' },
      { id: '#ORD-2051', customer: 'Owen Clark', channel: 'Marketplace', total: '$540', payment: 'Refund', state: 'Hold' }
    ];
  }

  async products(): Promise<ProductRow[]> {
    await delay(500);
    return [
      { sku: 'PRD-110', name: 'Ariana Pro', category: 'Subscription', stock: 1200, revenue: '$48.2K', state: 'Active' },
      { sku: 'PRD-220', name: 'Admin Kit', category: 'Template', stock: 420, revenue: '$19.4K', state: 'Active' },
      { sku: 'PRD-310', name: 'Release Pack', category: 'Add-on', stock: 310, revenue: '$12.8K', state: 'Draft' }
    ];
  }

  async roles(): Promise<RoleCard[]> {
    await delay(480);
    return [
      { name: 'Owner', description: 'Full workspace ownership with billing and release actions.', permissions: '42', users: '3', tone: 'accent' },
      { name: 'Manager', description: 'Operational access for users, orders, reports, and products.', permissions: '31', users: '8', tone: 'purple' },
      { name: 'Analyst', description: 'Read-only reporting access with export and dashboard views.', permissions: '18', users: '12', tone: 'warning' }
    ];
  }

  async reports(): Promise<ReportItem[]> {
    await delay(540);
    return [
      { name: 'Revenue Summary', owner: 'Finance', state: 'Ready', progress: '100%', bar: 'full' },
      { name: 'User Growth', owner: 'Marketing', state: 'Scheduled', progress: '74%', bar: 'high' },
      { name: 'Release Review', owner: 'Platform', state: 'Ready', progress: '100%', bar: 'full' },
      { name: 'Inventory Health', owner: 'Operations', state: 'Draft', progress: '45%', bar: 'mid' }
    ];
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
