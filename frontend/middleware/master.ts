import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
  auth.hydrate();
  if (!auth.isAuthenticated) return navigateTo('/login');
  if (!auth.isMaster) return navigateTo(auth.home);
});
