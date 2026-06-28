import { computed, signal } from '@ariana/core';

export type AdminUser = {
  name: string;
  email: string;
  role: string;
};

export class AuthService {
  readonly user = signal<AdminUser | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly isAuthenticated = computed(() => this.user() !== undefined);

  async login(email: string, password: string) {
    this.loading.set(true);
    this.error.set(undefined);

    await sleep(450);

    if (!email.includes('@') || password.length < 4) {
      this.error.set('Invalid demo credentials. Use admin@ariana.dev / demo1234.');
      this.loading.set(false);
      return false;
    }

    this.user.set({ name: 'Alex Morgan', email, role: 'Administrator' });
    this.loading.set(false);
    return true;
  }

  logout() {
    this.user.set(undefined);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
