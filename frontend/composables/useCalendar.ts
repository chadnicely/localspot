import type { CalendarHub } from '~/types';

/**
 * Resolves the active public calendar from the route (path-based today, e.g.
 * /northportfoodtrucks; later a subdomain) and exposes the calendar + account branding.
 */
export function useCalendar() {
  const route = useRoute();
  const api = useApi();

  const subdomain = computed(() => String(route.params.hub || ''));

  const { data: hub, error } = useAsyncData(
    () => `cal-${subdomain.value}`,
    () => api.get<CalendarHub>(`/public/${subdomain.value}`),
    { watch: [subdomain] },
  );

  const brand = computed(() => hub.value?.brand);
  const calendar = computed(() => hub.value?.calendar);

  return { subdomain, hub, brand, calendar, error };
}
