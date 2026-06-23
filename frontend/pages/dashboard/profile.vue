<script setup lang="ts">
import type { FoodTruck } from '~/types';
import { FOOD_CATEGORIES } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'auth' });

const api = useApi();
const { data: truck, refresh } = await useAsyncData('profile-truck', () =>
  api.get<FoodTruck>('/me/truck'),
);

const form = reactive<Partial<FoodTruck>>({ foodCategories: [] });
watchEffect(() => {
  if (truck.value) Object.assign(form, truck.value);
});

const saving = ref(false);
const saved = ref(false);
const error = ref('');
const uploadingLogo = ref(false);
const uploadingPhoto = ref(false);

function toggleCategory(cat: string) {
  const list = form.foodCategories ?? [];
  form.foodCategories = list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
}

async function save() {
  error.value = '';
  saved.value = false;
  saving.value = true;
  try {
    const body = {
      name: form.name,
      description: form.description,
      foodCategories: form.foodCategories,
      websiteUrl: form.websiteUrl,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
      menuUrl: form.menuUrl,
      phone: form.phone,
      email: form.email,
    };
    await api.patch('/me/truck', body);
    saved.value = true;
    await refresh();
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save your profile.';
  } finally {
    saving.value = false;
  }
}

async function uploadImage(kind: 'logo' | 'photo', e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  const flag = kind === 'logo' ? uploadingLogo : uploadingPhoto;
  flag.value = true;
  error.value = '';
  try {
    const res = await api.upload<{ url: string; truck: FoodTruck }>(`/me/truck/${kind}`, fd);
    if (kind === 'logo') form.logoUrl = res.url;
    else form.mainImageUrl = res.url;
    await refresh();
  } catch (e: any) {
    error.value = e?.data?.message || 'Image upload failed.';
  } finally {
    flag.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div>
    <PageHeader title="My Profile" subtitle="This is what customers see on your public page." />

    <div class="max-w-3xl space-y-6 p-8">
      <!-- Images -->
      <div class="card p-6">
        <h2 class="mb-4 font-semibold text-gray-900">Logo & Photo</h2>
        <div class="flex flex-wrap items-center gap-6">
          <div class="text-center">
            <TruckLogo :name="form.name || 'Truck'" :logo-url="form.logoUrl" size="lg" />
            <label class="btn-secondary mt-2 cursor-pointer text-xs">
              {{ uploadingLogo ? 'Uploading…' : 'Upload logo' }}
              <input type="file" accept="image/*" class="hidden" @change="uploadImage('logo', $event)" />
            </label>
          </div>
          <div class="text-center">
            <div class="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img v-if="form.mainImageUrl" :src="form.mainImageUrl" class="h-full w-full object-cover" />
              <Icon v-else name="heroicons:photo" class="h-8 w-8 text-gray-300" />
            </div>
            <label class="btn-secondary mt-2 cursor-pointer text-xs">
              {{ uploadingPhoto ? 'Uploading…' : 'Upload photo' }}
              <input type="file" accept="image/*" class="hidden" @change="uploadImage('photo', $event)" />
            </label>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="card space-y-4 p-6">
        <h2 class="font-semibold text-gray-900">Truck Details</h2>
        <div>
          <label class="label">Truck name</label>
          <input v-model="form.name" class="input" />
        </div>
        <div>
          <label class="label">Description</label>
          <textarea v-model="form.description" rows="3" class="input" />
        </div>
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

      <!-- Contact & links -->
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
          {{ saving ? 'Saving…' : 'Save profile' }}
        </button>
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
      </div>
    </div>
  </div>
</template>
