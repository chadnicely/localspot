<script setup lang="ts">
import type { Listing } from '~/types';
import { calendarListingsLabel } from '~/types';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));
const { calendar } = useCalendar();

const { data: listings } = await useAsyncData(`dir-${sub.value}`, () =>
  api.get<Listing[]>(`/public/${sub.value}/listings`),
);

const search = ref('');
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  return (listings.value ?? []).filter(
    (l) =>
      !q ||
      l.name.toLowerCase().includes(q) ||
      (l.cuisineType || '').toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q),
  );
});

const title = computed(() => (calendar.value ? calendarListingsLabel(calendar.value.type) : 'Directory'));
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
    <p class="mt-1 text-gray-500">Everyone listed on {{ calendar?.name }}.</p>

    <div class="relative mt-5">
      <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input v-model="search" type="search" placeholder="Search…" class="input pl-10" />
    </div>

    <div class="mt-6">
      <div v-if="filtered.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="l in filtered" :key="l._id" :listing="l" :sub="sub" />
      </div>
      <div v-else class="card px-6 py-16 text-center text-gray-500">Nothing matches your search.</div>
    </div>
  </div>
</template>
