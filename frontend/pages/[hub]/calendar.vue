<script setup lang="ts">
import type { CalendarStop } from '~/types';
import { DAYS_OF_WEEK } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));

const { data: week } = await useAsyncData(`cal-week-${sub.value}`, () =>
  api.get<CalendarStop[]>(`/public/${sub.value}/calendar/week`),
);

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

const today = new Date();
const cursor = reactive({ year: today.getFullYear(), month: today.getMonth() });
const selected = ref<Date>(new Date(today));

const monthLabel = computed(() =>
  new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
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
  selected.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
);
const mapPoints = computed<MapPoint[]>(() =>
  selectedStops.value
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      lat: s.latitude as number,
      lng: s.longitude as number,
      title: s.listing.name,
      subtitle: `${s.locationName} · ${formatRange(s.startTime, s.endTime)}`,
      link: `/${sub.value}/listings/${s.listing.slug}`,
    })),
);
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900">Community Calendar</h1>
    <p class="text-gray-500">Click any day to see what's happening and where.</p>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div class="card p-4 lg:col-span-3">
        <div class="mb-3 flex items-center justify-between">
          <button class="btn-secondary px-3 py-1.5" @click="shiftMonth(-1)"><Icon name="heroicons:chevron-left" class="h-4 w-4" /></button>
          <h2 class="text-lg font-semibold text-gray-900">{{ monthLabel }}</h2>
          <button class="btn-secondary px-3 py-1.5" @click="shiftMonth(1)"><Icon name="heroicons:chevron-right" class="h-4 w-4" /></button>
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
              :class="sameDay(cell, selected) ? 'border-transparent text-white' : 'border-transparent hover:bg-gray-100'"
              :style="sameDay(cell, selected) ? { background: 'var(--brand)' } : {}"
              @click="selected = cell"
            >
              <span>{{ cell.getDate() }}</span>
              <span
                v-if="stopsForDate(cell).length"
                class="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                :class="sameDay(cell, selected) ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'"
              >{{ stopsForDate(cell).length }}</span>
            </button>
          </template>
        </div>
      </div>

      <div class="space-y-4 lg:col-span-2">
        <div class="card p-5">
          <h3 class="flex items-center gap-2 font-semibold text-gray-900">
            <Icon name="heroicons:calendar-days" class="h-5 w-5" :style="{ color: 'var(--brand)' }" />
            {{ selectedLabel }}
          </h3>
          <ClientOnly>
            <TruckMap v-if="mapPoints.length" :points="mapPoints" height="240px" class="mt-3" />
          </ClientOnly>
          <div class="mt-4 space-y-3">
            <NuxtLink
              v-for="s in selectedStops"
              :key="(s.id || s._id) + s.listing.id"
              :to="`/${sub}/listings/${s.listing.slug}`"
              class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
            >
              <ListingLogo :name="s.listing.name" :logo-url="s.listing.logoUrl" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-900">{{ s.listing.name }}</p>
                <p class="truncate text-sm text-gray-500">{{ s.locationName }}</p>
                <p class="text-xs text-gray-400">{{ formatRange(s.startTime, s.endTime) }}</p>
              </div>
            </NuxtLink>
            <p v-if="!selectedStops.length" class="py-6 text-center text-sm text-gray-400">Nothing scheduled this day.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
