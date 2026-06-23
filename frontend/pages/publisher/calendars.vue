<script setup lang="ts">
import type { Calendar } from '~/types';
import { CALENDAR_TYPES, calendarTypeLabel } from '~/types';
import { useWorkspaceStore } from '~/stores/workspace';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const ws = useWorkspaceStore();
const { data: calendars, refresh } = await useAsyncData('manage-calendars', () =>
  api.get<Calendar[]>('/publisher/calendars'),
);

const showCreate = ref(false);
const creating = ref(false);
const error = ref('');
const blank = () => ({ name: '', type: 'food_truck', subdomain: '' });
const form = reactive(blank());

watch(
  () => form.name,
  (v) => {
    if (!form.subdomain) form.subdomain = v.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '');
  },
);

function openCreate() {
  Object.assign(form, blank());
  error.value = '';
  showCreate.value = true;
}
async function create() {
  error.value = '';
  creating.value = true;
  try {
    const c = await api.post<Calendar>('/publisher/calendars', { ...form });
    ws.set(c._id);
    showCreate.value = false;
    await refresh();
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not create the calendar.';
  } finally {
    creating.value = false;
  }
}
async function toggleActive(c: Calendar) {
  await api.patch(`/publisher/calendars/${c._id}`, { active: !c.active });
  await refresh();
}
async function remove(c: Calendar) {
  if (!confirm(`Delete calendar "${c.name}"? Its listings stay in the database but the site goes offline.`)) return;
  await api.del(`/publisher/calendars/${c._id}`);
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader title="Calendars" subtitle="Each calendar is its own public site with its own subdomain.">
      <template #actions>
        <button class="btn-primary" @click="openCreate"><Icon name="heroicons:plus" class="h-4 w-4" /> New calendar</button>
      </template>
    </PageHeader>

    <div class="p-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div v-for="c in calendars || []" :key="c._id" class="card p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-gray-900">{{ c.name }}</p>
              <p class="text-sm text-gray-500">{{ calendarTypeLabel(c.type) }}</p>
              <a :href="`/${c.subdomain}`" target="_blank" class="mt-1 inline-block font-mono text-xs text-brand-600">
                {{ c.subdomain }}.onthespot.com
              </a>
            </div>
            <StatusBadge :active="c.active" active-label="Live" inactive-label="Off" />
          </div>
          <div class="mt-4 flex gap-2">
            <button class="btn-secondary px-3 py-1 text-xs" @click="ws.set(c._id)">Work on this</button>
            <button class="btn-secondary px-3 py-1 text-xs" @click="toggleActive(c)">{{ c.active ? 'Turn off' : 'Turn on' }}</button>
            <button class="btn-danger px-3 py-1 text-xs" @click="remove(c)">Delete</button>
          </div>
        </div>
        <div v-if="!(calendars && calendars.length)" class="card px-6 py-16 text-center text-gray-400 sm:col-span-2">
          No calendars yet. Create your first one.
        </div>
      </div>
    </div>

    <ModalDialog v-if="showCreate" title="New calendar" @close="showCreate = false">
      <div class="space-y-4">
        <div>
          <label class="label">Calendar name</label>
          <input v-model="form.name" class="input" placeholder="North Port Food Trucks" />
        </div>
        <div>
          <label class="label">Type</label>
          <select v-model="form.type" class="input">
            <option v-for="t in CALENDAR_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="label">Subdomain</label>
          <div class="flex items-center gap-2">
            <input v-model="form.subdomain" class="input" placeholder="northportfoodtrucks" />
            <span class="whitespace-nowrap text-sm text-gray-400">.onthespot.com</span>
          </div>
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showCreate = false">Cancel</button>
        <button class="btn-primary" :disabled="creating" @click="create">{{ creating ? 'Creating…' : 'Create calendar' }}</button>
      </template>
    </ModalDialog>
  </div>
</template>
