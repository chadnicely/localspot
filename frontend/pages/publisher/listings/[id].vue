<script setup lang="ts">
import type { Listing } from '~/types';
import { FOOD_CATEGORIES } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const route = useRoute();
const api = useApi();
const { selected } = useCalendars();
const id = computed(() => String(route.params.id));
const isNew = computed(() => id.value === 'new');

const form = reactive<Partial<Listing>>({ status: 'approved', featured: false });

if (!isNew.value) {
  const existing = await api.get<Listing>(`/publisher/listings/${id.value}`);
  Object.assign(form, existing);
}

const saving = ref(false);
const saved = ref(false);
const error = ref('');

async function save() {
  error.value = '';
  saved.value = false;
  saving.value = true;
  try {
    const body: any = {
      name: form.name,
      description: form.description,
      category: form.category,
      cuisineType: form.cuisineType,
      phone: form.phone,
      email: form.email,
      websiteUrl: form.websiteUrl,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
      menuUrl: form.menuUrl,
      address: form.address,
      city: form.city,
      state: form.state,
      status: form.status,
      featured: form.featured,
    };
    if (isNew.value) {
      if (!selected.value) throw new Error('No calendar selected');
      const created = await api.post<Listing>(`/publisher/calendars/${selected.value._id}/listings`, body);
      await navigateTo(`/publisher/listings/${created._id}`);
    } else {
      await api.patch(`/publisher/listings/${id.value}`, body);
      saved.value = true;
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Save failed';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader :title="isNew ? 'New Listing' : form.name || 'Edit Listing'" subtitle="Publisher editor">
      <template #actions>
        <NuxtLink to="/publisher/listings" class="btn-secondary">← All listings</NuxtLink>
      </template>
    </PageHeader>

    <div class="max-w-2xl space-y-6 p-8">
      <div class="card space-y-4 p-6">
        <div><label class="label">Name</label><input v-model="form.name" class="input" /></div>
        <div><label class="label">Description</label><textarea v-model="form.description" rows="3" class="input" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Category</label>
            <select v-model="form.category" class="input">
              <option value="">—</option>
              <option v-for="c in FOOD_CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div><label class="label">Cuisine</label><input v-model="form.cuisineType" class="input" /></div>
        </div>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm"><input v-model="form.featured" type="checkbox" /> Featured</label>
          <div>
            <label class="label">Status</label>
            <select v-model="form.status" class="input py-1.5 text-sm">
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <h2 class="font-semibold text-gray-900 sm:col-span-2">Contact & Location</h2>
        <div><label class="label">Phone</label><input v-model="form.phone" class="input" /></div>
        <div><label class="label">Email</label><input v-model="form.email" class="input" /></div>
        <div><label class="label">Website</label><input v-model="form.websiteUrl" class="input" /></div>
        <div><label class="label">Menu URL</label><input v-model="form.menuUrl" class="input" /></div>
        <div><label class="label">Facebook</label><input v-model="form.facebookUrl" class="input" /></div>
        <div><label class="label">Instagram</label><input v-model="form.instagramUrl" class="input" /></div>
        <div><label class="label">Address</label><input v-model="form.address" class="input" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">City</label><input v-model="form.city" class="input" /></div>
          <div><label class="label">State</label><input v-model="form.state" class="input" /></div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : isNew ? 'Create listing' : 'Save changes' }}</button>
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
      </div>
    </div>
  </div>
</template>
