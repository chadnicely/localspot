<script setup lang="ts">
import type { Listing, ScheduleEntry } from '~/types';
import { FOOD_CATEGORIES, BUSINESS_CATEGORIES, DAYS_OF_WEEK, listingTypeLabel } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'owner' });

const route = useRoute();
const api = useApi();
const id = computed(() => String(route.params.id));

const { data: listing, refresh } = await useAsyncData(`my-listing-${id.value}`, () =>
  api.get<Listing>(`/me/listings/${id.value}`),
);
const { data: schedule, refresh: refreshSchedule } = await useAsyncData(
  `my-listing-sched-${id.value}`,
  () => api.get<ScheduleEntry[]>(`/me/listings/${id.value}/schedule`),
);

const tab = ref<'profile' | 'schedule'>('profile');

// ---- Profile ----
const form = reactive<Partial<Listing>>({});
watchEffect(() => {
  if (listing.value) Object.assign(form, listing.value);
});
const savingProfile = ref(false);
const savedProfile = ref(false);
const uploadingLogo = ref(false);
const uploadingCover = ref(false);

const categoryOptions = computed(() =>
  form.type === 'food_truck' ? FOOD_CATEGORIES : BUSINESS_CATEGORIES,
);

async function saveProfile() {
  savedProfile.value = false;
  savingProfile.value = true;
  try {
    await api.patch(`/me/listings/${id.value}`, {
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
    });
    savedProfile.value = true;
    await refresh();
  } finally {
    savingProfile.value = false;
  }
}

async function uploadImage(kind: 'logo' | 'cover', e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  const flag = kind === 'logo' ? uploadingLogo : uploadingCover;
  flag.value = true;
  try {
    const res = await api.upload<{ url: string }>(`/me/listings/${id.value}/${kind}`, fd);
    if (kind === 'logo') form.logoUrl = res.url;
    else form.coverImageUrl = res.url;
    await refresh();
  } finally {
    flag.value = false;
    input.value = '';
  }
}

// ---- Schedule ----
const showModal = ref(false);
const editingId = ref<string | null>(null);
const savingStop = ref(false);
const stopError = ref('');

const blank = (): Partial<ScheduleEntry> => ({
  dayOfWeek: 'Monday',
  startTime: '11:00',
  endTime: '14:00',
  locationName: '',
  address: '',
  latitude: null,
  longitude: null,
  notes: '',
  status: 'active',
});
const stop = reactive<Partial<ScheduleEntry>>(blank());

function openNew() {
  editingId.value = null;
  Object.assign(stop, blank());
  stopError.value = '';
  showModal.value = true;
}
function openEdit(entry: ScheduleEntry) {
  editingId.value = entry.id || entry._id || null;
  Object.assign(stop, blank(), entry);
  stopError.value = '';
  showModal.value = true;
}

async function saveStop() {
  stopError.value = '';
  savingStop.value = true;
  try {
    const body = {
      dayOfWeek: stop.dayOfWeek,
      startTime: stop.startTime,
      endTime: stop.endTime,
      locationName: stop.locationName,
      address: stop.address,
      latitude: stop.latitude ?? undefined,
      longitude: stop.longitude ?? undefined,
      notes: stop.notes,
      status: stop.status,
    };
    if (editingId.value) {
      await api.patch(`/me/listings/${id.value}/schedule/${editingId.value}`, body);
    } else {
      await api.post(`/me/listings/${id.value}/schedule`, body);
    }
    showModal.value = false;
    await refreshSchedule();
  } catch (e: any) {
    stopError.value = e?.data?.message || 'Could not save this stop.';
  } finally {
    savingStop.value = false;
  }
}
async function removeStop() {
  if (!editingId.value || !confirm('Delete this stop?')) return;
  savingStop.value = true;
  try {
    await api.del(`/me/listings/${id.value}/schedule/${editingId.value}`);
    showModal.value = false;
    await refreshSchedule();
  } finally {
    savingStop.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader :title="listing?.name || 'Listing'" :subtitle="listing ? listingTypeLabel(listing.type) : ''">
      <template #actions>
        <NuxtLink to="/dashboard" class="btn-secondary">← My listings</NuxtLink>
      </template>
    </PageHeader>

    <div class="p-8">
      <!-- Tabs -->
      <div class="mb-6 flex gap-2">
        <button class="chip" :class="tab === 'profile' ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white text-gray-600'" @click="tab = 'profile'">Profile</button>
        <button class="chip" :class="tab === 'schedule' ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white text-gray-600'" @click="tab = 'schedule'">Schedule</button>
      </div>

      <!-- Profile tab -->
      <div v-show="tab === 'profile'" class="max-w-2xl space-y-6">
        <div class="card p-6">
          <h2 class="mb-4 font-semibold text-gray-900">Logo & Cover</h2>
          <div class="flex flex-wrap items-center gap-6">
            <div class="text-center">
              <ListingLogo :name="form.name || 'Listing'" :logo-url="form.logoUrl" size="lg" />
              <label class="btn-secondary mt-2 cursor-pointer text-xs">
                {{ uploadingLogo ? 'Uploading…' : 'Upload logo' }}
                <input type="file" accept="image/*" class="hidden" @change="uploadImage('logo', $event)" />
              </label>
            </div>
            <div class="text-center">
              <div class="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img v-if="form.coverImageUrl" :src="form.coverImageUrl" class="h-full w-full object-cover" />
                <Icon v-else name="heroicons:photo" class="h-8 w-8 text-gray-300" />
              </div>
              <label class="btn-secondary mt-2 cursor-pointer text-xs">
                {{ uploadingCover ? 'Uploading…' : 'Upload cover' }}
                <input type="file" accept="image/*" class="hidden" @change="uploadImage('cover', $event)" />
              </label>
            </div>
          </div>
        </div>

        <div class="card space-y-4 p-6">
          <div><label class="label">Name</label><input v-model="form.name" class="input" /></div>
          <div><label class="label">Description</label><textarea v-model="form.description" rows="3" class="input" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Category</label>
              <select v-model="form.category" class="input">
                <option value="">—</option>
                <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div v-if="form.type === 'food_truck'">
              <label class="label">Cuisine</label><input v-model="form.cuisineType" class="input" />
            </div>
          </div>
        </div>

        <div class="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <h2 class="font-semibold text-gray-900 sm:col-span-2">Contact & Links</h2>
          <div><label class="label">Phone</label><input v-model="form.phone" class="input" /></div>
          <div><label class="label">Email</label><input v-model="form.email" class="input" /></div>
          <div><label class="label">Website</label><input v-model="form.websiteUrl" class="input" /></div>
          <div><label class="label">Menu URL</label><input v-model="form.menuUrl" class="input" /></div>
          <div><label class="label">Facebook</label><input v-model="form.facebookUrl" class="input" /></div>
          <div><label class="label">Instagram</label><input v-model="form.instagramUrl" class="input" /></div>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn-primary" :disabled="savingProfile" @click="saveProfile">{{ savingProfile ? 'Saving…' : 'Save profile' }}</button>
          <span v-if="savedProfile" class="text-sm text-green-600">✓ Saved</span>
        </div>
      </div>

      <!-- Schedule tab -->
      <div v-show="tab === 'schedule'" class="max-w-3xl">
        <div class="mb-4 flex justify-end">
          <button class="btn-primary" @click="openNew"><Icon name="heroicons:plus" class="h-4 w-4" /> Add stop</button>
        </div>
        <div class="card divide-y divide-gray-100">
          <div v-for="entry in schedule || []" :key="entry.id || entry._id" class="flex items-center gap-4 px-5 py-4">
            <div class="w-14 shrink-0 font-semibold text-navy-700">{{ shortDay(entry.dayOfWeek) }}</div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-gray-900">{{ entry.locationName }}</p>
              <p class="truncate text-xs text-gray-500">{{ entry.address }}</p>
            </div>
            <div class="shrink-0 text-sm text-gray-600">{{ formatRange(entry.startTime, entry.endTime) }}</div>
            <button class="text-sm font-medium text-brand-600 hover:text-brand-700" @click="openEdit(entry)">Edit</button>
          </div>
          <p v-if="!(schedule && schedule.length)" class="px-5 py-12 text-center text-sm text-gray-400">No stops yet.</p>
        </div>
      </div>
    </div>

    <!-- Stop modal -->
    <ModalDialog v-if="showModal" :title="editingId ? 'Edit Stop' : 'Add Stop'" @close="showModal = false">
      <div class="space-y-4">
        <div>
          <label class="label">Day</label>
          <select v-model="stop.dayOfWeek" class="input">
            <option v-for="d in DAYS_OF_WEEK" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">Start</label><input v-model="stop.startTime" type="time" class="input" /></div>
          <div><label class="label">End</label><input v-model="stop.endTime" type="time" class="input" /></div>
        </div>
        <div><label class="label">Location name</label><input v-model="stop.locationName" class="input" /></div>
        <div><label class="label">Address</label><input v-model="stop.address" class="input" /></div>
        <div>
          <div class="mb-1 flex items-center justify-between">
            <label class="label mb-0">Pin location (optional)</label>
            <button v-if="stop.latitude != null" type="button" class="text-xs text-gray-400 hover:text-red-600" @click="stop.latitude = null; stop.longitude = null">Clear</button>
          </div>
          <ClientOnly>
            <LocationPicker v-model:lat="stop.latitude" v-model:lng="stop.longitude" height="200px" />
          </ClientOnly>
        </div>
        <div><label class="label">Notes</label><input v-model="stop.notes" class="input" /></div>
        <div>
          <label class="label">Status</label>
          <select v-model="stop.status" class="input">
            <option value="active">active</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <p v-if="stopError" class="text-sm text-red-600">{{ stopError }}</p>
      </div>
      <template #footer>
        <button v-if="editingId" class="btn-danger mr-auto" :disabled="savingStop" @click="removeStop">Delete</button>
        <button class="btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn-primary" :disabled="savingStop" @click="saveStop">{{ savingStop ? 'Saving…' : 'Save stop' }}</button>
      </template>
    </ModalDialog>
  </div>
</template>
