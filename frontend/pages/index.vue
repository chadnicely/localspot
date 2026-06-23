<script setup lang="ts">
import type { CalendarStop } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

const api = useApi();
const selectedDay = ref(todayName());

const { data: stops, pending } = await useAsyncData(
  'calendar',
  () =>
    selectedDay.value === todayName()
      ? api.get<CalendarStop[]>('/public/calendar/today')
      : api.get<CalendarStop[]>(`/public/calendar?day=${selectedDay.value}`),
  { watch: [selectedDay], default: () => [] as CalendarStop[] },
);

const heading = computed(() =>
  selectedDay.value === todayName() ? `Today · ${selectedDay.value}` : selectedDay.value,
);

const mapPoints = computed<MapPoint[]>(() =>
  (stops.value ?? [])
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
  <div>
    <!-- Hero -->
    <section class="bg-navy-900 text-white">
      <div class="mx-auto max-w-6xl px-4 py-10 text-center">
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Find Your Favorite Food Trucks This Week
        </h1>
        <p class="mx-auto mt-2 max-w-2xl text-navy-100">
          See where local food trucks are popping up around town — all in one simple calendar.
        </p>
        <div class="mt-6 flex flex-col items-center gap-3">
          <DayTabs :active="selectedDay" include-today @select="selectedDay = $event" />
          <NuxtLink to="/calendar" class="text-sm font-medium text-brand-300 hover:text-brand-200">
            Or open the full monthly calendar →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Day listing -->
    <section class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-lg font-semibold text-navy-900">
          <Icon name="heroicons:calendar-days" class="h-5 w-5 text-brand-600" />
          {{ heading }}
        </h2>
        <NuxtLink to="/directory" class="text-sm font-medium text-brand-600 hover:text-brand-700">
          All food trucks →
        </NuxtLink>
      </div>

      <!-- Map of the day's stops -->
      <ClientOnly>
        <TruckMap v-if="mapPoints.length" :points="mapPoints" height="300px" class="mb-6" />
      </ClientOnly>

      <TruckGrid :stops="stops || []" :pending="pending" />
    </section>
  </div>
</template>
