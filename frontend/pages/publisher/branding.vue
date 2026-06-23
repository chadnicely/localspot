<script setup lang="ts">
import type { Publisher } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const { data: hub, refresh } = await useAsyncData('branding-hub', () =>
  api.get<Publisher>('/me/publisher'),
);

const form = reactive<Partial<Publisher>>({});
watchEffect(() => {
  if (hub.value) Object.assign(form, hub.value);
});

const saving = ref(false);
const saved = ref(false);
const uploading = ref(false);

async function save() {
  saved.value = false;
  saving.value = true;
  try {
    await api.patch('/me/publisher', {
      name: form.name,
      city: form.city,
      state: form.state,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      websiteUrl: form.websiteUrl,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
      contactEmail: form.contactEmail,
    });
    saved.value = true;
    await refresh();
  } finally {
    saving.value = false;
  }
}

async function uploadLogo(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  uploading.value = true;
  try {
    const res = await api.upload<{ url: string }>('/me/publisher/logo', fd);
    form.logoUrl = res.url;
    await refresh();
  } finally {
    uploading.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div>
    <PageHeader title="Hub Setup" subtitle="Set up your white-label site — logo, colours, and details.">
      <template #actions>
        <a v-if="hub" :href="`/${hub.subdomain}`" target="_blank" class="btn-secondary">Preview my hub</a>
      </template>
    </PageHeader>
    <div class="max-w-2xl space-y-6 p-8">
      <div class="card p-6">
        <h2 class="mb-4 font-semibold text-gray-900">Logo</h2>
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img v-if="form.logoUrl" :src="form.logoUrl" class="h-full w-full object-cover" />
            <Icon v-else name="heroicons:photo" class="h-7 w-7 text-gray-300" />
          </div>
          <label class="btn-secondary cursor-pointer">
            {{ uploading ? 'Uploading…' : 'Upload logo' }}
            <input type="file" accept="image/*" class="hidden" @change="uploadLogo" />
          </label>
        </div>
      </div>

      <div class="card space-y-4 p-6">
        <h2 class="font-semibold text-gray-900">Hub details</h2>
        <div><label class="label">Hub name</label><input v-model="form.name" class="input" /></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">City</label><input v-model="form.city" class="input" /></div>
          <div><label class="label">State</label><input v-model="form.state" class="input" /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Primary color</label>
            <div class="flex items-center gap-2">
              <input v-model="form.primaryColor" type="color" class="h-10 w-14 rounded border border-gray-300" />
              <input v-model="form.primaryColor" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Secondary color</label>
            <div class="flex items-center gap-2">
              <input v-model="form.secondaryColor" type="color" class="h-10 w-14 rounded border border-gray-300" />
              <input v-model="form.secondaryColor" class="input" />
            </div>
          </div>
        </div>
      </div>

      <div class="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <h2 class="font-semibold text-gray-900 sm:col-span-2">Links</h2>
        <div><label class="label">Contact email</label><input v-model="form.contactEmail" class="input" /></div>
        <div><label class="label">Website</label><input v-model="form.websiteUrl" class="input" /></div>
        <div><label class="label">Facebook</label><input v-model="form.facebookUrl" class="input" /></div>
        <div><label class="label">Instagram</label><input v-model="form.instagramUrl" class="input" /></div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save branding' }}</button>
        <a v-if="hub" :href="`/${hub.subdomain}`" target="_blank" class="btn-secondary">Preview hub</a>
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
      </div>
    </div>
  </div>
</template>
