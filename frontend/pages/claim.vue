<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types';

useHead({ title: 'Claim Your Local Hub · On The Spot' });

const auth = useAuthStore();
const api = useApi();

const form = reactive({
  name: '',
  subdomain: '',
  city: '',
  state: '',
  email: '',
  password: '',
});
const error = ref('');
const loading = ref(false);

// Auto-suggest subdomain from the newsletter name
watch(
  () => form.name,
  (v) => {
    if (!form.subdomain || form.subdomain === slugifyClient(form._prev || '')) {
      form.subdomain = slugifyClient(v);
    }
    (form as any)._prev = v;
  },
);

function slugifyClient(s: string) {
  return s
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post<{ accessToken: string; user: AuthUser }>('/auth/claim-publisher', {
      name: form.name,
      subdomain: form.subdomain,
      city: form.city,
      state: form.state,
      email: form.email,
      password: form.password,
    });
    auth.setSession(res.accessToken, res.user);
    await navigateTo('/publisher');
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not create your hub.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-12">
    <div class="card p-8">
      <h1 class="text-2xl font-bold text-gray-900">Claim Your Local Hub</h1>
      <p class="mt-1 text-gray-500">
        Set up a branded discovery site for your newsletter community. We'll review and approve
        new hubs before they go live.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label class="label">Newsletter / hub name</label>
          <input v-model="form.name" class="input" placeholder="North Port Matters" required />
        </div>
        <div>
          <label class="label">Subdomain</label>
          <div class="flex items-center gap-2">
            <input v-model="form.subdomain" class="input" placeholder="northport" required />
            <span class="whitespace-nowrap text-sm text-gray-400">.onthespot.com</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">City</label>
            <input v-model="form.city" class="input" required />
          </div>
          <div>
            <label class="label">State</label>
            <input v-model="form.state" class="input" required />
          </div>
        </div>
        <hr />
        <div>
          <label class="label">Your email</label>
          <input v-model="form.email" type="email" class="input" autocomplete="email" required />
        </div>
        <div>
          <label class="label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            autocomplete="new-password"
            minlength="6"
            required
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Creating…' : 'Create my hub' }}
        </button>
        <p class="text-center text-xs text-gray-400">
          Your hub starts as “pending” until a platform admin approves it.
        </p>
      </form>
    </div>
  </div>
</template>
