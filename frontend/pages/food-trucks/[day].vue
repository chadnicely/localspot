<script setup lang="ts">
import type { CalendarStop } from '~/types';
import { DAYS_OF_WEEK } from '~/types';

const route = useRoute();
const router = useRouter();
const api = useApi();

// Normalize "monday" -> "Monday"
const day = computed(() => {
  const raw = String(route.params.day || '').toLowerCase();
  return DAYS_OF_WEEK.find((d) => d.toLowerCase() === raw) ?? '';
});

if (!day.value) {
  throw createError({ statusCode: 404, statusMessage: 'Unknown day', fatal: true });
}

const { data: stops, pending } = await useAsyncData(
  () => `calendar-${day.value}`,
  () => api.get<CalendarStop[]>(`/public/calendar?day=${day.value}`),
  { watch: [day], default: () => [] as CalendarStop[] },
);

function selectDay(d: string) {
  router.push(`/food-trucks/${d.toLowerCase()}`);
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6">
      <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700">← Back to calendar</NuxtLink>
      <h1 class="mt-2 text-2xl font-bold text-navy-900">{{ day }}'s Food Trucks</h1>
    </div>

    <div class="mb-6">
      <DayTabs :active="day" @select="selectDay" />
    </div>

    <TruckGrid :stops="stops || []" :pending="pending" />
  </div>
</template>
