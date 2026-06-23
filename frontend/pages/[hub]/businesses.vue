<script setup lang="ts">
import type { Listing } from '~/types';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));

const { data: businesses } = await useAsyncData(`biz-${sub.value}`, () =>
  api.get<Listing[]>(`/public/${sub.value}/listings?type=business`),
);

const search = ref('');
const activeCategory = ref('All');

const categories = computed(() => {
  const set = new Set<string>();
  (businesses.value ?? []).forEach((b) => b.category && set.add(b.category));
  return ['All', ...Array.from(set).sort()];
});

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  return (businesses.value ?? []).filter((b) => {
    const matchesCat = activeCategory.value === 'All' || b.category === activeCategory.value;
    const matchesSearch = !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="text-2xl font-bold text-gray-900">Local Businesses</h1>
    <p class="mt-1 text-gray-500">Discover businesses in the community.</p>

    <div class="relative mt-5">
      <Icon name="heroicons:magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input v-model="search" type="search" placeholder="Search businesses…" class="input pl-10" />
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat"
        class="chip"
        :class="activeCategory === cat ? 'text-white' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'"
        :style="activeCategory === cat ? { background: 'var(--brand)', borderColor: 'var(--brand)' } : {}"
        @click="activeCategory = cat"
      >{{ cat }}</button>
    </div>

    <div class="mt-6">
      <div v-if="filtered.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="l in filtered" :key="l._id" :listing="l" :sub="sub" />
      </div>
      <div v-else class="card px-6 py-16 text-center text-gray-500">No businesses match your search.</div>
    </div>
  </div>
</template>
