<script setup lang="ts">
import type { ScheduleEntry } from '~/types';
import { DAYS_OF_WEEK } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'auth' });

const api = useApi();
const { data: entries, refresh } = await useAsyncData('owner-schedule', () =>
  api.get<ScheduleEntry[]>('/me/truck/schedule'),
);

const showModal = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const error = ref('');

const blank = (): Partial<ScheduleEntry> => ({
  dayOfWeek: 'Monday',
  startTime: '11:00',
  endTime: '14:00',
  locationName: '',
  address: '',
  latitude: null,
  longitude: null,
  notes: '',
  status: 'scheduled',
});
const form = reactive<Partial<ScheduleEntry>>(blank());

function openNew() {
  editingId.value = null;
  Object.assign(form, blank());
  error.value = '';
  showModal.value = true;
}

function openEdit(entry: ScheduleEntry) {
  editingId.value = entry.id || entry._id || null;
  Object.assign(form, blank(), entry);
  error.value = '';
  showModal.value = true;
}

async function save() {
  error.value = '';
  saving.value = true;
  try {
    const body = {
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      locationName: form.locationName,
      address: form.address,
      latitude: form.latitude ?? undefined,
      longitude: form.longitude ?? undefined,
      notes: form.notes,
      status: form.status,
    };
    if (editingId.value) await api.patch(`/me/truck/schedule/${editingId.value}`, body);
    else await api.post('/me/truck/schedule', body);
    showModal.value = false;
    await refresh();
  } catch (e: any) {
    error.value = e?.data?.message || 'Could not save this stop.';
  } finally {
    saving.value = false;
  }
}

async function remove() {
  if (!editingId.value) return;
  if (!confirm('Delete this stop?')) return;
  saving.value = true;
  try {
    await api.del(`/me/truck/schedule/${editingId.value}`);
    showModal.value = false;
    await refresh();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader title="My Schedule" subtitle="Add your stops for the week — they go live instantly.">
      <template #actions>
        <button class="btn-primary" @click="openNew">
          <Icon name="heroicons:plus" class="h-4 w-4" /> Add Stop
        </button>
      </template>
    </PageHeader>

    <div class="max-w-3xl p-8">
      <div class="card divide-y divide-gray-100">
        <div
          v-for="entry in entries || []"
          :key="entry.id || entry._id"
          class="flex items-center gap-4 px-5 py-4"
        >
          <div class="w-14 shrink-0 font-semibold text-navy-700">{{ shortDay(entry.dayOfWeek) }}</div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-gray-900">{{ entry.locationName }}</p>
            <p class="truncate text-xs text-gray-500">{{ entry.address }}</p>
          </div>
          <div class="shrink-0 text-sm text-gray-600">
            {{ formatRange(entry.startTime, entry.endTime) }}
          </div>
          <button class="text-sm font-medium text-brand-600 hover:text-brand-700" @click="openEdit(entry)">
            Edit
          </button>
        </div>
        <p v-if="!(entries && entries.length)" class="px-5 py-12 text-center text-sm text-gray-400">
          No stops yet. Click “Add Stop” to get started.
        </p>
      </div>
    </div>

    <ModalDialog
      v-if="showModal"
      :title="editingId ? 'Edit Stop' : 'Add Stop'"
      @close="showModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="label">Day</label>
          <select v-model="form.dayOfWeek" class="input">
            <option v-for="d in DAYS_OF_WEEK" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Start time</label>
            <input v-model="form.startTime" type="time" class="input" />
          </div>
          <div>
            <label class="label">End time</label>
            <input v-model="form.endTime" type="time" class="input" />
          </div>
        </div>
        <div>
          <label class="label">Location name</label>
          <input v-model="form.locationName" class="input" placeholder="North Port Brewing Company" />
        </div>
        <div>
          <label class="label">Address</label>
          <input v-model="form.address" class="input" placeholder="1750 S. Biscayne Dr, North Port, FL" />
        </div>
        <div>
          <div class="mb-1 flex items-center justify-between">
            <label class="label mb-0">Pin location on map (optional)</label>
            <button
              v-if="form.latitude != null"
              type="button"
              class="text-xs text-gray-400 hover:text-red-600"
              @click="form.latitude = null; form.longitude = null"
            >
              Clear pin
            </button>
          </div>
          <ClientOnly>
            <LocationPicker
              v-model:lat="form.latitude"
              v-model:lng="form.longitude"
              height="200px"
            />
          </ClientOnly>
          <p class="mt-1 text-xs text-gray-400">
            <template v-if="form.latitude != null">
              📍 {{ form.latitude?.toFixed(4) }}, {{ form.longitude?.toFixed(4) }} — click the map to move the pin.
            </template>
            <template v-else>Click the map to drop a pin so customers can find you.</template>
          </p>
        </div>
        <div>
          <label class="label">Notes (optional)</label>
          <input v-model="form.notes" class="input" placeholder="Great spot — outdoor seating!" />
        </div>
        <div>
          <label class="label">Status</label>
          <select v-model="form.status" class="input">
            <option value="scheduled">Scheduled</option>
            <option value="updated">Updated</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>

      <template #footer>
        <button v-if="editingId" class="btn-danger mr-auto" :disabled="saving" @click="remove">
          Delete Stop
        </button>
        <button class="btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save Stop' }}
        </button>
      </template>
    </ModalDialog>
  </div>
</template>
