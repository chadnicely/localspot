<script setup lang="ts">
import type { Calendar } from '~/types';
import { calendarTypeLabel } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const route = useRoute();
const api = useApi();
const id = computed(() => String(route.params.id));

const { data: calendar, refresh } = await useAsyncData(`cal-edit-${id.value}`, () =>
  api.get<Calendar>(`/publisher/calendars/${id.value}`),
);

const form = reactive<Partial<Calendar>>({});
watchEffect(() => {
  if (calendar.value) Object.assign(form, calendar.value);
});

const saving = ref(false);
const saved = ref(false);
const error = ref('');
const uploading = ref(false);

async function save() {
  saved.value = false;
  error.value = '';
  saving.value = true;
  try {
    await api.patch(`/publisher/calendars/${id.value}`, {
      name: form.name,
      tagline: form.tagline,
      subdomain: form.subdomain,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      accentColor: form.accentColor,
      active: form.active,
    });
    saved.value = true;
    await refresh();
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save the calendar.';
  } finally {
    saving.value = false;
  }
}

async function uploadHero(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  uploading.value = true;
  try {
    const res = await api.upload<{ url: string }>(`/publisher/calendars/${id.value}/hero`, fd);
    form.heroImageUrl = res.url;
    await refresh();
  } finally {
    uploading.value = false;
    input.value = '';
  }
}
async function removeHero() {
  await api.patch(`/publisher/calendars/${id.value}`, { heroImageUrl: '' });
  form.heroImageUrl = '';
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader :title="form.name || 'Edit Calendar'" :subtitle="calendar ? calendarTypeLabel(calendar.type) + ' calendar' : ''">
      <template #actions>
        <a v-if="calendar" :href="`/${calendar.subdomain}`" target="_blank" class="btn-secondary">Open site</a>
        <NuxtLink to="/publisher/calendars" class="btn-secondary">← All calendars</NuxtLink>
      </template>
    </PageHeader>

    <div class="max-w-2xl space-y-6 p-8">
      <!-- Title + tagline + subdomain -->
      <div class="card space-y-4 p-6">
        <h2 class="font-semibold text-gray-900">Title & address</h2>
        <div>
          <label class="label">Title (shown at the top of the calendar)</label>
          <input v-model="form.name" class="input" placeholder="North Port Food Trucks" />
        </div>
        <div>
          <label class="label">Tagline (optional subheadline)</label>
          <input v-model="form.tagline" class="input" placeholder="Find local food trucks this week" />
        </div>
        <div>
          <label class="label">Subdomain</label>
          <div class="flex items-center gap-2">
            <input v-model="form.subdomain" class="input" />
            <span class="whitespace-nowrap text-sm text-gray-400">.onthespot.com</span>
          </div>
        </div>
      </div>

      <!-- Theme colors -->
      <div class="card space-y-4 p-6">
        <h2 class="font-semibold text-gray-900">Theme colors</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="label">Main color</label>
            <div class="flex items-center gap-2">
              <input v-model="form.primaryColor" type="color" class="h-10 w-12 rounded border border-gray-300" />
              <input v-model="form.primaryColor" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Supporting (header)</label>
            <div class="flex items-center gap-2">
              <input v-model="form.secondaryColor" type="color" class="h-10 w-12 rounded border border-gray-300" />
              <input v-model="form.secondaryColor" class="input" />
            </div>
          </div>
          <div>
            <label class="label">Accent</label>
            <div class="flex items-center gap-2">
              <input v-model="form.accentColor" type="color" class="h-10 w-12 rounded border border-gray-300" />
              <input v-model="form.accentColor" class="input" />
            </div>
          </div>
        </div>
        <!-- Preview swatch -->
        <div class="flex items-center gap-2">
          <span class="h-8 w-16 rounded" :style="{ background: form.primaryColor }" />
          <span class="h-8 w-16 rounded" :style="{ background: form.secondaryColor }" />
          <span class="h-8 w-16 rounded" :style="{ background: form.accentColor }" />
        </div>
      </div>

      <!-- Hero image -->
      <div class="card space-y-3 p-6">
        <h2 class="font-semibold text-gray-900">Front-page image</h2>
        <div class="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-gray-200" :style="{ background: form.secondaryColor || '#1f3559' }">
          <img v-if="form.heroImageUrl" :src="form.heroImageUrl" class="h-full w-full object-cover opacity-80" />
          <span v-else class="text-sm text-white/70">No image yet</span>
        </div>
        <div class="flex gap-2">
          <label class="btn-secondary cursor-pointer">
            {{ uploading ? 'Uploading…' : form.heroImageUrl ? 'Replace image' : 'Upload image' }}
            <input type="file" accept="image/*" class="hidden" @change="uploadHero" />
          </label>
          <button v-if="form.heroImageUrl" type="button" class="btn-secondary" @click="removeHero">Remove</button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save calendar' }}</button>
        <span v-if="saved" class="text-sm text-green-600">✓ Saved</span>
        <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
      </div>
    </div>
  </div>
</template>
