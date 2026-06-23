<script setup lang="ts">
import type { CalendarStop } from '~/types';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));
const selectedDay = ref(todayName());

const { data: stops, pending } = await useAsyncData(
  `ft-${sub.value}`,
  () =>
    selectedDay.value === todayName()
      ? api.get<CalendarStop[]>(`/public/${sub.value}/calendar/today`)
      : api.get<CalendarStop[]>(`/public/${sub.value}/calendar?day=${selectedDay.value}`),
  { watch: [selectedDay], default: () => [] as CalendarStop[] },
);

// Only food trucks
const truckStops = computed(() => (stops.value ?? []).filter((s) => s.listing.type === 'food_truck'));
</script>

<template>
  <div>
    <section class="text-white" style="background: var(--brand-dark)">
      <div class="mx-auto max-w-6xl px-4 py-8 text-center">
        <h1 class="text-2xl font-extrabold sm:text-3xl">Food Trucks This Week</h1>
        <p class="mt-1 text-white/70">See who's serving and where, every day.</p>
        <div class="mt-5 flex justify-center">
          <DayTabs :active="selectedDay" include-today @select="selectedDay = $event" />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-8">
      <ListingGrid :stops="truckStops" :pending="pending" :sub="sub" empty-text="No food trucks scheduled this day." />
    </section>
  </div>
</template>
