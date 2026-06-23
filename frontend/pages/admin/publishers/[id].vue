<script setup lang="ts">
import type { Publisher } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const route = useRoute();
const api = useApi();
const id = computed(() => String(route.params.id));

const { data: pub, refresh } = await useAsyncData(`admin-pub-${id.value}`, () =>
  api.get<Publisher>(`/admin/publishers/${id.value}`),
);

const form = reactive<Partial<Publisher>>({});
watchEffect(() => {
  if (pub.value) Object.assign(form, pub.value);
});

const saving = ref(false);
const saved = ref(false);

async function save() {
  saved.value = false;
  saving.value = true;
  try {
    await api.patch(`/admin/publishers/${id.value}`, {
      name: form.name,
      city: form.city,
      state: form.state,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      status: form.status,
      websiteUrl: form.websiteUrl,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
    });
    saved.value = true;
    await refresh();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader :title="pub?.name || 'Publisher'" subtitle="Master admin editor">
      <template #actions>
        <NuxtLink to="/admin/publishers" class="btn-secondary">← All publishers</NuxtLink>
      </template>
    </PageHeader>

    <div class="max-w-2xl space-y-6 p-8">
      <div class="card space-y-4 p-6">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">Name</label><input v-model="form.name" class="input" /></div>
          <div>
            <label class="label">Status</label>
            <select v-model="form.status" class="input">
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="suspended">suspended</option>
            </select>
          </div>
          <div><label class="label">City</label><input v-model="form.city" class="input" /></div>
          <div><label class="label">State</label><input v-model="form.state" class="input" /></div>
          <div>
            <label class="label">Primary color</label>
            <input v-model="form.primaryColor" type="color" class="h-10 w-full rounded-lg border border-gray-300" />
          </div>
          <div>
            <label class="label">Secondary color</label>
            <input v-model="form.secondaryColor" type="color" class="h-10 w-full rounded-lg border border-gray-300" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div><label class="label">Website</label><input v-model="form.websiteUrl" class="input" /></div>
          <div><label class="label">Facebook</label><input v-model="form.facebookUrl" class="input" /></div>
          <div><label class="label">Instagram</label><input v-model="form.instagramUrl" class="input" /></div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
        <a v-if="pub" :href="`/${pub.subdomain}`" target="_blank" class="btn-secondary">View hub</a>
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
      </div>
    </div>
  </div>
</template>
