import { computed, signal } from '@ariana/core';

export type AdminUser = {
  name: string;
  email: string;
  role: string;
};

const demoEmail = 'admin@ariana.dev';
const demoPassword = 'demo1234';

export class AuthService {
  readonly user = signal<AdminUser | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly isAuthenticated = computed(() => this.user() !== undefined);

  async login(email: string, password: string) {
    this.loading.set(true);
    this.error.set(undefined);

    await sleep(360);

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== demoEmail || password !== demoPassword) {
      this.error.set('Use the demo credentials: admin@ariana.dev / demo1234.');
      this.loading.set(false);
      return false;
    }

    this.user.set({ name: 'Alex Morgan', email: demoEmail, role: 'Administrator' });
    this.loading.set(false);
    return true;
  }

  async loginDemo() {
    return this.login(demoEmail, demoPassword);
  }

  logout() {
    this.user.set(undefined);
    this.error.set(undefined);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
