<script setup lang="ts">
import type { FoodTruck } from '~/types';
import { FOOD_CATEGORIES } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const route = useRoute();
const api = useApi();
const id = computed(() => String(route.params.id));

const { data: truck, refresh } = await useAsyncData(`admin-truck-${id.value}`, () =>
  api.get<FoodTruck>(`/admin/trucks/${id.value}`),
);

const form = reactive<Partial<FoodTruck>>({ foodCategories: [] });
watchEffect(() => {
  if (truck.value) Object.assign(form, truck.value);
});

const saving = ref(false);
const saved = ref(false);
const error = ref('');

function toggleCategory(cat: string) {
  const list = form.foodCategories ?? [];
  form.foodCategories = list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
}

async function save() {
  error.value = '';
  saved.value = false;
  saving.value = true;
  try {
    await api.patch(`/admin/trucks/${id.value}`, {
      name: form.name,
      description: form.description,
      foodCategories: form.foodCategories,
      phone: form.phone,
      email: form.email,
      websiteUrl: form.websiteUrl,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
      menuUrl: form.menuUrl,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      paymentStatus: form.paymentStatus,
    });
    saved.value = true;
    await refresh();
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader :title="truck?.name || 'Edit Truck'" subtitle="Admin editor">
      <template #actions>
        <NuxtLink to="/admin/trucks" class="btn-secondary">← All trucks</NuxtLink>
      </template>
    </PageHeader>

    <div class="max-w-3xl space-y-6 p-8">
      <!-- Admin controls -->
      <div class="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
        <h2 class="font-semibold text-gray-900 sm:col-span-3">Listing Controls</h2>
        <label class="flex items-center gap-2">
          <input v-model="form.isActive" type="checkbox" /> <span class="text-sm">Active (live)</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="form.isFeatured" type="checkbox" /> <span class="text-sm">Featured</span>
        </label>
        <div>
          <label class="label">Payment</label>
          <select v-model="form.paymentStatus" class="input py-1.5 text-sm">
            <option value="unpaid">unpaid</option>
            <option value="paid">paid</option>
            <option value="trial">trial</option>
            <option value="comped">comped</option>
          </select>
        </div>
      </div>

      <!-- Profile -->
      <div class="card space-y-4 p-6">
        <h2 class="font-semibold text-gray-900">Profile</h2>
        <div><label class="label">Name</label><input v-model="form.name" class="input" /></div>
        <div><label class="label">Description</label><textarea v-model="form.description" rows="3" class="input" /></div>
        <div>
          <label class="label">Food categories</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in FOOD_CATEGORIES"
              :key="cat"
              type="button"
              class="chip"
              :class="
                form.foodCategories?.includes(cat)
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              "
              @click="toggleCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <div class="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <h2 class="font-semibold text-gray-900 sm:col-span-2">Contact & Links</h2>
        <div><label class="label">Phone</label><input v-model="form.phone" class="input" /></div>
        <div><label class="label">Email</label><input v-model="form.email" class="input" /></div>
        <div><label class="label">Website URL</label><input v-model="form.websiteUrl" class="input" /></div>
        <div><label class="label">Menu URL</label><input v-model="form.menuUrl" class="input" /></div>
        <div><label class="label">Facebook URL</label><input v-model="form.facebookUrl" class="input" /></div>
        <div><label class="label">Instagram URL</label><input v-model="form.instagramUrl" class="input" /></div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
        <NuxtLink v-if="truck" :to="`/trucks/${truck.slug}`" target="_blank" class="btn-secondary">
          View public page
        </NuxtLink>
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
      </div>
    </div>
  </div>
</template>
