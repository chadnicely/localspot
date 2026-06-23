import type { HubBranding } from '~/types';

/**
 * Resolves the active publisher hub from the route (path-based today, e.g.
 * /northport/...; later a subdomain). Centralizes tenant + branding lookup so
 * switching to real subdomains is a routing change only.
 */
export function usePublisher() {
  const route = useRoute();
  const api = useApi();

  const subdomain = computed(() => String(route.params.hub || ''));

  const { data: hub, error } = useAsyncData(
    () => `hub-${subdomain.value}`,
    () => api.get<HubBranding>(`/public/${subdomain.value}`),
    { watch: [subdomain] },
  );

  return { subdomain, hub, error };
}
