<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import type { AuthUser } from '~/types';

definePageMeta({ layout: false });

const auth = useAuthStore();
const api = useApi();

const plans = [
  { id: 'weekly', name: '$10 / week', note: 'Cancel anytime' },
  { id: 'featured', name: '$15 / week', note: 'Best value — featured placement' },
  { id: 'monthly', name: '$49 / month', note: 'Save 15%' },
];

const truckName = ref('');
const email = ref('');
const password = ref('');
const plan = ref('weekly');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const res = await api.post<{ accessToken: string; user: AuthUser }>('/auth/register', {
      truckName: truckName.value,
      email: email.value,
      password: password.value,
      plan: plan.value,
    });
    auth.setSession(res.accessToken, res.user);
    await navigateTo('/dashboard');
  } catch (e: any) {
    error.value = e?.data?.message || 'Sign up failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-10">
    <div class="card w-full max-w-3xl p-8">
      <div class="text-center">
        <h1 class="text-2xl font-extrabold text-brand-700">JOIN THE FOOD TRUCK CALENDAR!</h1>
        <p class="mt-1 text-gray-500">
          Get your truck in front of thousands of local residents.
        </p>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Plan options -->
        <div>
          <h2 class="mb-3 font-semibold text-gray-900">Plan options</h2>
          <div class="space-y-3">
            <label
              v-for="p in plans"
              :key="p.id"
              class="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition"
              :class="plan === p.id ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'"
            >
              <input v-model="plan" type="radio" :value="p.id" class="text-brand-600" />
              <div>
                <p class="font-semibold text-gray-900">{{ p.name }}</p>
                <p class="text-xs text-gray-500">{{ p.note }}</p>
              </div>
            </label>
          </div>
          <p class="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <Icon name="heroicons:lock-closed" class="h-4 w-4" />
            Payment is arranged after sign-up — an admin activates your listing.
          </p>
        </div>

        <!-- Account -->
        <div>
          <h2 class="mb-3 font-semibold text-gray-900">Create your account</h2>
          <form class="space-y-4" @submit.prevent="submit">
            <div>
              <label class="label">Truck name</label>
              <input v-model="truckName" class="input" placeholder="Rosie's Red Truck" required />
            </div>
            <div>
              <label class="label">Email address</label>
              <input v-model="email" type="email" class="input" autocomplete="email" required />
            </div>
            <div>
              <label class="label">Password</label>
              <input
                v-model="password"
                type="password"
                class="input"
                autocomplete="new-password"
                minlength="6"
                required
              />
            </div>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            <button type="submit" class="btn-primary w-full" :disabled="loading">
              {{ loading ? 'Creating account…' : 'Sign Up & Continue' }}
            </button>
          </form>
          <p class="mt-4 text-center text-sm text-gray-500">
            Already listed?
            <NuxtLink to="/login" class="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
