import { defineStore } from 'pinia';
import type { AuthUser } from '~/types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    setSession(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
      const cookie = useCookie<string | null>('ft_token', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      cookie.value = token;
      const userCookie = useCookie<AuthUser | null>('ft_user', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      userCookie.value = user;
    },
    hydrate() {
      if (this.token) return;
      const cookie = useCookie<string | null>('ft_token');
      const userCookie = useCookie<AuthUser | null>('ft_user');
      if (cookie.value) {
        this.token = cookie.value;
        this.user = userCookie.value ?? null;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      useCookie('ft_token').value = null;
      useCookie('ft_user').value = null;
    },
  },
});
