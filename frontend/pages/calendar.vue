<script setup lang="ts">
import type { CalendarStop } from '~/types';
import { DAYS_OF_WEEK } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

useHead({ title: 'Food Truck Calendar · North Port' });

const api = useApi();
const { data: week } = await useAsyncData('calendar-week', () =>
  api.get<CalendarStop[]>('/public/calendar/week'),
);

// Group all weekly stops by weekday name.
const byDay = computed(() => {
  const map: Record<string, CalendarStop[]> = {};
  for (const s of week.value ?? []) (map[s.dayOfWeek] ||= []).push(s);
  return map;
});

function weekdayOf(date: Date) {
  return DAYS_OF_WEEK[(date.getDay() + 6) % 7];
}
function stopsForDate(date: Date) {
  return byDay.value[weekdayOf(date)] ?? [];
}

// Month grid state
const today = new Date();
const cursor = reactive({ year: today.getFullYear(), month: today.getMonth() });
const selected = ref<Date>(new Date(today));

const monthLabel = computed(() =>
  new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }),
);

const weekdayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const cells = computed(() => {
  const first = new Date(cursor.year, cursor.month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const out: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) out.push(null);
  for (let d = 1; d <= daysInMonth; d++) out.push(new Date(cursor.year, cursor.month, d));
  while (out.length % 7 !== 0) out.push(null);
  return out;
});

function shiftMonth(delta: number) {
  const d = new Date(cursor.year, cursor.month + delta, 1);
  cursor.year = d.getFullYear();
  cursor.month = d.getMonth();
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const selectedStops = computed(() => stopsForDate(selected.value));
const selectedLabel = computed(() =>
  selected.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }),
);

const mapPoints = computed<MapPoint[]>(() =>
  selectedStops.value
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      lat: s.latitude as number,
      lng: s.longitude as number,
      title: s.truck.name,
      subtitle: `${s.locationName} · ${formatRange(s.startTime, s.endTime)}`,
      link: `/trucks/${s.truck.slug}`,
    })),
);
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-navy-900">Food Truck Calendar</h1>
      <p class="text-gray-500">Click any day to see who's serving and where.</p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <!-- Calendar grid -->
      <div class="card p-4 lg:col-span-3">
        <div class="mb-3 flex items-center justify-between">
          <button class="btn-secondary px-3 py-1.5" @click="shiftMonth(-1)">
            <Icon name="heroicons:chevron-left" class="h-4 w-4" />
          </button>
          <h2 class="text-lg font-semibold text-navy-900">{{ monthLabel }}</h2>
          <button class="btn-secondary px-3 py-1.5" @click="shiftMonth(1)">
            <Icon name="heroicons:chevron-right" class="h-4 w-4" />
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
          <div v-for="w in weekdayHeaders" :key="w" class="py-1">{{ w }}</div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <template v-for="(cell, i) in cells" :key="i">
            <div v-if="!cell" class="aspect-square" />
            <button
              v-else
              class="flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition"
              :class="[
                sameDay(cell, selected)
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-transparent hover:bg-gray-100',
                sameDay(cell, today) && !sameDay(cell, selected) ? 'ring-1 ring-brand-400' : '',
              ]"
              @click="selected = cell"
            >
              <span>{{ cell.getDate() }}</span>
              <span
                v-if="stopsForDate(cell).length"
                class="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                :class="sameDay(cell, selected) ? 'bg-white text-brand-700' : 'bg-brand-100 text-brand-700'"
              >
                {{ stopsForDate(cell).length }}
              </span>
            </button>
          </template>
        </div>

        <p class="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <span class="inline-block h-3 w-3 rounded-full bg-brand-100" />
          number = trucks serving that day
        </p>
      </div>

      <!-- Selected day panel -->
      <div class="space-y-4 lg:col-span-2">
        <div class="card p-5">
          <h3 class="flex items-center gap-2 font-semibold text-navy-900">
            <Icon name="heroicons:calendar-days" class="h-5 w-5 text-brand-600" />
            {{ selectedLabel }}
          </h3>

          <ClientOnly>
            <TruckMap
              v-if="mapPoints.length"
              :points="mapPoints"
              height="240px"
              class="mt-3"
            />
            <template #fallback>
              <div class="mt-3 h-[240px] animate-pulse rounded-xl bg-gray-100" />
            </template>
          </ClientOnly>

          <div class="mt-4 space-y-3">
            <NuxtLink
              v-for="s in selectedStops"
              :key="(s.id || s._id) + s.truck.id"
              :to="`/trucks/${s.truck.slug}`"
              class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40"
            >
              <TruckLogo :name="s.truck.name" :logo-url="s.truck.logoUrl" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-900">{{ s.truck.name }}</p>
                <p class="truncate text-sm text-gray-500">
                  <Icon name="heroicons:map-pin" class="inline h-3.5 w-3.5 text-brand-600" />
                  {{ s.locationName }}
                </p>
                <p class="text-xs text-gray-400">{{ formatRange(s.startTime, s.endTime) }}</p>
              </div>
            </NuxtLink>

            <p v-if="!selectedStops.length" class="py-6 text-center text-sm text-gray-400">
              No food trucks scheduled this day.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
