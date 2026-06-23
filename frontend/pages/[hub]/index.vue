<script setup lang="ts">
import type { CalendarStop, Listing } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));

const [{ data: today }, { data: trucks }, { data: businesses }] = await Promise.all([
  useAsyncData(`home-today-${sub.value}`, () => api.get<CalendarStop[]>(`/public/${sub.value}/calendar/today`), { default: () => [] as CalendarStop[] }),
  useAsyncData(`home-trucks-${sub.value}`, () => api.get<Listing[]>(`/public/${sub.value}/listings?type=food_truck`), { default: () => [] as Listing[] }),
  useAsyncData(`home-biz-${sub.value}`, () => api.get<Listing[]>(`/public/${sub.value}/listings?type=business`), { default: () => [] as Listing[] }),
]);

const mapPoints = computed<MapPoint[]>(() =>
  (today.value ?? [])
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      lat: s.latitude as number,
      lng: s.longitude as number,
      title: s.listing.name,
      subtitle: `${s.locationName} · ${formatRange(s.startTime, s.endTime)}`,
      link: `/${sub.value}/listings/${s.listing.slug}`,
    })),
);

const featuredBiz = computed(() => (businesses.value ?? []).filter((b) => b.featured));
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <!-- Happening today -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Icon name="heroicons:bolt" class="h-6 w-6" :style="{ color: 'var(--brand)' }" /> Happening Today
        </h2>
        <NuxtLink :to="`/${sub}/calendar`" class="text-sm font-medium" :style="{ color: 'var(--brand)' }">Full calendar →</NuxtLink>
      </div>
      <ClientOnly>
        <TruckMap v-if="mapPoints.length" :points="mapPoints" height="280px" class="mb-5" />
      </ClientOnly>
      <ListingGrid :stops="today || []" :sub="sub" empty-text="Nothing scheduled today — check the calendar." />
    </section>

    <!-- Food trucks -->
    <section v-if="trucks && trucks.length" class="mt-12">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Food Trucks</h2>
        <NuxtLink :to="`/${sub}/food-trucks`" class="text-sm font-medium" :style="{ color: 'var(--brand)' }">View schedule →</NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ListingCard v-for="l in trucks.slice(0, 4)" :key="l._id" :listing="l" :sub="sub" />
      </div>
    </section>

    <!-- Featured businesses -->
    <section v-if="featuredBiz.length" class="mt-12">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Featured Businesses</h2>
        <NuxtLink :to="`/${sub}/businesses`" class="text-sm font-medium" :style="{ color: 'var(--brand)' }">All businesses →</NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ListingCard v-for="l in featuredBiz" :key="l._id" :listing="l" :sub="sub" />
      </div>
    </section>
  </div>
</template>
