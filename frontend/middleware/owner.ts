import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore();
  auth.hydrate();
  if (!auth.isAuthenticated) return navigateTo('/login');
  if (!auth.isOwner) return navigateTo(auth.home);
});
