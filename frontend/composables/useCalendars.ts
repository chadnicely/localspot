import type { Calendar } from '~/types';
import { useWorkspaceStore } from '~/stores/workspace';

/**
 * Loads the account's calendars and tracks the selected one (workspace).
 * Defaults the selection to the first calendar.
 */
export function useCalendars() {
  const api = useApi();
  const ws = useWorkspaceStore();

  const { data: calendars, refresh } = useAsyncData('account-calendars', () =>
    api.get<Calendar[]>('/publisher/calendars'),
  );

  watchEffect(() => {
    ws.hydrate();
    const list = calendars.value || [];
    if (list.length && (!ws.calendarId || !list.find((c) => c._id === ws.calendarId))) {
      ws.set(list[0]._id);
    }
  });

  const selected = computed<Calendar | null>(() => {
    const list = calendars.value || [];
    return list.find((c) => c._id === ws.calendarId) || list[0] || null;
  });

  return { calendars, selected, refresh };
}
