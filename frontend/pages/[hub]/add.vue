<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { LISTING_TYPES } from '~/types';
import type { AuthUser } from '~/types';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const auth = useAuthStore();
const sub = computed(() => String(route.params.hub));

const form = reactive({
  type: 'food_truck',
  name: '',
  email: '',
  password: '',
  description: '',
  phone: '',
  websiteUrl: '',
});
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post<{ accessToken: string; user: AuthUser }>(
      `/public/${sub.value}/claim-listing`,
      { ...form },
    );
    auth.setSession(res.accessToken, res.user);
    await navigateTo('/dashboard');
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not submit your listing.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-12">
    <div class="card p-8">
      <h1 class="text-2xl font-bold text-gray-900">Add Your Business</h1>
      <p class="mt-1 text-gray-500">
        Submit your listing for the publisher to review. Once approved, you can log in to manage
        your profile and schedule.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <div>
          <label class="label">What are you listing?</label>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              v-for="t in LISTING_TYPES"
              :key="t.value"
              type="button"
              class="flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition"
              :class="form.type === t.value ? 'text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
              :style="form.type === t.value ? { background: 'var(--brand)', borderColor: 'var(--brand)' } : {}"
              @click="form.type = t.value"
            >
              <Icon :name="t.icon" class="h-5 w-5" />
              {{ t.label }}
            </button>
          </div>
        </div>
        <div><label class="label">Name</label><input v-model="form.name" class="input" required /></div>
        <div><label class="label">Short description</label><textarea v-model="form.description" rows="2" class="input" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">Phone</label><input v-model="form.phone" class="input" /></div>
          <div><label class="label">Website</label><input v-model="form.websiteUrl" class="input" /></div>
        </div>
        <hr />
        <div><label class="label">Your email</label><input v-model="form.email" type="email" class="input" autocomplete="email" required /></div>
        <div><label class="label">Password</label><input v-model="form.password" type="password" class="input" autocomplete="new-password" minlength="6" required /></div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button type="submit" class="btn-brand w-full" :disabled="loading">{{ loading ? 'Submitting…' : 'Submit for approval' }}</button>
        <p class="text-center text-xs text-gray-400">Already listed? <NuxtLink to="/login" class="font-medium" :style="{ color: 'var(--brand)' }">Sign in</NuxtLink></p>
      </form>
    </div>
  </div>
</template>
