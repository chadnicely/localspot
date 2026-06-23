<script setup lang="ts">
import type { FoodTruck } from '~/types';

const api = useApi();

const { data: trucks, pending } = await useAsyncData('directory', () =>
  api.get<FoodTruck[]>('/public/trucks'),
);

const search = ref('');
const activeCategory = ref('All');

// Category chips: "All" + the categories actually present on listed trucks.
const categories = computed(() => {
  const set = new Set<string>();
  (trucks.value ?? []).forEach((t) => t.foodCategories.forEach((c) => set.add(c)));
  return ['All', ...Array.from(set).sort()];
});

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  return (trucks.value ?? []).filter((t) => {
    const matchesCat =
      activeCategory.value === 'All' || t.foodCategories.includes(activeCategory.value);
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.foodCategories.join(' ').toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });
});
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="text-2xl font-bold text-navy-900">Food Truck Directory</h1>
    <p class="mt-1 text-gray-500">Browse every truck listed on the North Port calendar.</p>

    <!-- Search -->
    <div class="relative mt-5">
      <Icon
        name="heroicons:magnifying-glass"
        class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
      />
      <input
        v-model="search"
        type="search"
        placeholder="Search trucks, food types, locations…"
        class="input pl-10"
      />
    </div>

    <!-- Category filter -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat"
        class="chip"
        :class="
          activeCategory === cat
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
        "
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Grid -->
    <div class="mt-6">
      <div v-if="pending" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="card h-40 animate-pulse bg-gray-100" />
      </div>
      <div
        v-else-if="filtered.length"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <TruckCard v-for="t in filtered" :key="t._id" :truck="t" />
      </div>
      <div v-else class="card px-6 py-16 text-center text-gray-500">
        No trucks match your search.
      </div>
    </div>
  </div>
</template>
