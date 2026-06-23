import { useAuthStore } from '~/stores/auth';

/**
 * Thin $fetch wrapper for the API. Attaches the JWT bearer token and
 * redirects to login on 401.
 */
export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const base = config.public.apiBase as string;

  async function request<T>(path: string, opts: any = {}): Promise<T> {
    try {
      return await $fetch<T>(path, {
        baseURL: base,
        ...opts,
        headers: {
          ...(opts.headers || {}),
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
      });
    } catch (err: any) {
      if (err?.response?.status === 401 && import.meta.client) {
        auth.logout();
        await navigateTo('/login');
      }
      throw err;
    }
  }

  return {
    get: <T>(path: string, opts = {}) => request<T>(path, { method: 'GET', ...opts }),
    post: <T>(path: string, body?: any, opts = {}) =>
      request<T>(path, { method: 'POST', body, ...opts }),
    patch: <T>(path: string, body?: any, opts = {}) =>
      request<T>(path, { method: 'PATCH', body, ...opts }),
    del: <T>(path: string, opts = {}) => request<T>(path, { method: 'DELETE', ...opts }),
    upload: <T>(path: string, formData: FormData) =>
      request<T>(path, { method: 'POST', body: formData }),
    base,
  };
}
