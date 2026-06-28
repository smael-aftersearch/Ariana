import { computed, signal } from '@ariana/core';

export type Locale = 'en' | 'fa';

const messages: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', analytics: 'Analytics', users: 'Users', roles: 'Roles & Permissions', products: 'Products', orders: 'Orders', reports: 'Reports', calendar: 'Calendar', settings: 'Settings',
    loginTitle: 'Sign in to Ariana Admin', loginSubtitle: 'Use the demo account to enter the routed admin workspace.', email: 'Email', password: 'Password', signIn: 'Sign in', signOut: 'Sign out',
    search: 'Search users, orders, products...', loading: 'Loading page data...', reload: 'Reload data', createReport: 'Create Report', export: 'Export',
    main: 'Main', management: 'Management', workspace: 'Workspace', quickActions: 'Quick actions', commandPalette: 'Command palette', theme: 'Theme', language: 'Language',
    revenue: 'Revenue', openOrders: 'Open Orders', activeUsers: 'Active Users', releaseScore: 'Release Score', recentOrders: 'Recent Orders', activity: 'Activity', traffic: 'Traffic Sources', userDirectory: 'User Directory', productOps: 'Product Operations', reportCenter: 'Report Center',
    addUser: 'Add User', addRole: 'Add Role', addProduct: 'Add Product', addOrder: 'Add Order', addReport: 'Add Report', addNote: 'Add Note', save: 'Save changes', cancel: 'Cancel',
    routeMode: 'Routing, lazy loading, DI, query loading, login and i18n are active in this example.'
  },
  fa: {
    dashboard: 'داشبورد', analytics: 'تحلیل‌ها', users: 'کاربران', roles: 'نقش‌ها و دسترسی‌ها', products: 'محصولات', orders: 'سفارش‌ها', reports: 'گزارش‌ها', calendar: 'تقویم', settings: 'تنظیمات',
    loginTitle: 'ورود به پنل آریانا', loginSubtitle: 'با حساب نمونه وارد فضای ادمین روت‌شده شوید.', email: 'ایمیل', password: 'رمز عبور', signIn: 'ورود', signOut: 'خروج',
    search: 'جستجوی کاربر، سفارش، محصول...', loading: 'در حال بارگذاری داده صفحه...', reload: 'بارگذاری مجدد', createReport: 'ساخت گزارش', export: 'خروجی',
    main: 'اصلی', management: 'مدیریت', workspace: 'فضای کاری', quickActions: 'اکشن‌های سریع', commandPalette: 'فرمان‌ها', theme: 'تم', language: 'زبان',
    revenue: 'درآمد', openOrders: 'سفارش باز', activeUsers: 'کاربر فعال', releaseScore: 'امتیاز انتشار', recentOrders: 'آخرین سفارش‌ها', activity: 'فعالیت‌ها', traffic: 'منابع ترافیک', userDirectory: 'لیست کاربران', productOps: 'عملیات محصول', reportCenter: 'مرکز گزارش',
    addUser: 'افزودن کاربر', addRole: 'افزودن نقش', addProduct: 'افزودن محصول', addOrder: 'افزودن سفارش', addReport: 'افزودن گزارش', addNote: 'افزودن یادداشت', save: 'ذخیره تغییرات', cancel: 'انصراف',
    routeMode: 'در این نمونه routing، lazy loading، DI، query loading، login و چندزبانه فعال است.'
  }
};

export class I18nService {
  readonly locale = signal<Locale>('en');
  readonly direction = computed(() => this.locale() === 'fa' ? 'rtl' : 'ltr');

  toggle() {
    this.locale.update(value => value === 'en' ? 'fa' : 'en');
  }

  setLocale(locale: Locale) {
    this.locale.set(locale);
  }

  t(key: string): string {
    return messages[this.locale()][key] ?? messages.en[key] ?? key;
  }
}
