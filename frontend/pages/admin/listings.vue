<script setup lang="ts">
import type { Listing } from '~/types';
import { listingTypeLabel } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data: listings } = await useAsyncData('admin-listings', () =>
  api.get<Listing[]>('/admin/listings'),
);

const search = ref('');
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return listings.value ?? [];
  return (listings.value ?? []).filter((l) => l.name.toLowerCase().includes(q));
});
</script>

<template>
  <div>
    <PageHeader title="All Listings" subtitle="Every listing across all hubs." />
    <div class="p-8">
      <input v-model="search" type="search" placeholder="Search listings…" class="input mb-4 max-w-sm" />
      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="l in filtered" :key="l._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-navy-700">{{ l.name }}</td>
              <td class="px-4 py-3">{{ listingTypeLabel(l.type) }}</td>
              <td class="px-4 py-3 text-gray-500">{{ l.category || l.cuisineType || '—' }}</td>
              <td class="px-4 py-3">
                <span
                  class="badge"
                  :class="{
                    'bg-green-100 text-green-700': l.status === 'approved',
                    'bg-amber-100 text-amber-700': l.status === 'pending',
                    'bg-red-100 text-red-700': l.status === 'suspended',
                  }"
                >{{ l.status }}</span>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="4" class="px-4 py-12 text-center text-gray-400">No listings.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
