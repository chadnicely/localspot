import { defineStore } from 'pinia';
import type { AuthUser } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isMaster: (state) => state.user?.role === 'master_admin',
    isPublisher: (state) => state.user?.role === 'publisher',
    isOwner: (state) => state.user?.role === 'listing_owner',
    /** Where this user's dashboard lives. */
    home(): string {
      if (this.user?.role === 'master_admin') return '/admin';
      if (this.user?.role === 'publisher') return '/publisher';
      return '/dashboard';
    },
  },
  actions: {
    setSession(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
      const opts = { sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 7 };
      useCookie<string | null>('ots_token', opts).value = token;
      useCookie<AuthUser | null>('ots_user', opts).value = user;
    },
    hydrate() {
      if (this.token) return;
      const cookie = useCookie<string | null>('ots_token');
      const userCookie = useCookie<AuthUser | null>('ots_user');
      // Require both: a token without a known user role would cause redirect loops.
      if (cookie.value && userCookie.value) {
        this.token = cookie.value;
        this.user = userCookie.value;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      useCookie('ots_token').value = null;
      useCookie('ots_user').value = null;
    },
  },
});
