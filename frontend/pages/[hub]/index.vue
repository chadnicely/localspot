<script setup lang="ts">
import type { CalendarStop, Listing } from '~/types';
import { calendarListingsLabel } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));
const { calendar } = useCalendar();

const [{ data: today }, { data: listings }] = await Promise.all([
  useAsyncData(`home-today-${sub.value}`, () => api.get<CalendarStop[]>(`/public/${sub.value}/calendar/today`), { default: () => [] as CalendarStop[] }),
  useAsyncData(`home-listings-${sub.value}`, () => api.get<Listing[]>(`/public/${sub.value}/listings`), { default: () => [] as Listing[] }),
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

const featured = computed(() => (listings.value ?? []).filter((l) => l.featured));
const listingsLabel = computed(() => (calendar.value ? calendarListingsLabel(calendar.value.type) : 'Listings'));
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="relative overflow-hidden text-white"
      style="background: var(--brand-dark)"
    >
      <img
        v-if="calendar?.heroImageUrl"
        :src="calendar.heroImageUrl"
        class="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div class="relative mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
        <h1 class="text-3xl font-extrabold tracking-tight drop-shadow sm:text-4xl">
          {{ calendar?.name }}
        </h1>
        <p v-if="calendar?.tagline" class="mx-auto mt-2 max-w-2xl text-white/85">
          {{ calendar.tagline }}
        </p>
        <NuxtLink :to="`/${sub}/calendar`" class="btn-brand mt-6">View the calendar</NuxtLink>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-4 py-8">
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

    <section v-if="featured.length" class="mt-12">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">Featured</h2>
        <NuxtLink :to="`/${sub}/directory`" class="text-sm font-medium" :style="{ color: 'var(--brand)' }">All {{ listingsLabel.toLowerCase() }} →</NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ListingCard v-for="l in featured.slice(0, 4)" :key="l._id" :listing="l" :sub="sub" />
      </div>
    </section>
    </div>
  </div>
</template>
