<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types';

definePageMeta({ layout: false });

const auth = useAuthStore();
const api = useApi();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

onMounted(() => {
  auth.hydrate();
  if (auth.isAuthenticated) redirectByRole();
});

function redirectByRole() {
  navigateTo(auth.isAdmin ? '/admin' : '/dashboard');
}

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
      email: email.value,
      password: password.value,
    });
    auth.setSession(res.accessToken, res.user);
    redirectByRole();
  } catch (e: any) {
    error.value = e?.data?.message || 'Login failed. Check your credentials.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-navy-900 px-4">
    <div class="card w-full max-w-sm p-8">
      <NuxtLink to="/" class="mb-6 flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Icon name="heroicons:truck" class="h-5 w-5" />
        </div>
        <span class="text-lg font-semibold">Food Truck Calendar</span>
      </NuxtLink>
      <h1 class="mb-1 text-lg font-semibold text-gray-900">Sign in</h1>
      <p class="mb-6 text-sm text-gray-500">Food-truck owner & admin access.</p>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="label">Email</label>
          <input v-model="email" type="email" class="input" autocomplete="username" required />
        </div>
        <div>
          <label class="label">Password</label>
          <input
            v-model="password"
            type="password"
            class="input"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        New here?
        <NuxtLink to="/signup" class="font-medium text-brand-600 hover:text-brand-700">
          List your food truck
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
