import { defineStore } from 'pinia';

/** Which calendar the account owner is currently working in (workspace switcher). */
export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    calendarId: null as string | null,
  }),
  actions: {
    set(id: string) {
      this.calendarId = id;
      useCookie<string | null>('ots_calendar', {
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      }).value = id;
    },
    hydrate() {
      if (this.calendarId) return;
      const c = useCookie<string | null>('ots_calendar');
      if (c.value) this.calendarId = c.value;
    },
  },
});
