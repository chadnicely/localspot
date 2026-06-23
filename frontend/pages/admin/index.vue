<script setup lang="ts">
import type { MasterDashboard } from '~/types';
import { listingTypeLabel } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data } = await useAsyncData('master-dashboard', () =>
  api.get<MasterDashboard>('/admin/dashboard'),
);

const tiles = computed(() => {
  const d = data.value;
  if (!d) return [];
  return [
    { label: 'Publishers', value: d.approvedPublishers, sub: `${d.totalPublishers} total`, color: 'text-brand-600' },
    { label: 'Pending hubs', value: d.pendingPublishers, sub: 'Awaiting approval', color: 'text-amber-600' },
    { label: 'Listings', value: d.approvedListings, sub: `${d.totalListings} total`, color: 'text-navy-700' },
    { label: 'Pending listings', value: d.pendingListings, sub: 'Across all hubs', color: 'text-amber-600' },
  ];
});
</script>

<template>
  <div>
    <PageHeader title="Platform Overview" subtitle="All publishers and listings across On The Spot." />
    <div class="space-y-6 p-8">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="t in tiles" :key="t.label" class="card p-5">
          <p class="text-3xl font-bold" :class="t.color">{{ t.value }}</p>
          <p class="mt-1 text-sm font-medium text-gray-700">{{ t.label }}</p>
          <p class="text-xs text-gray-400">{{ t.sub }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="card p-6">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900">Recent Publishers</h2>
            <NuxtLink to="/admin/publishers" class="text-sm text-brand-600">View all</NuxtLink>
          </div>
          <div class="divide-y divide-gray-100">
            <NuxtLink
              v-for="p in data?.recentPublishers || []"
              :key="p.id"
              :to="`/admin/publishers/${p.id}`"
              class="flex items-center justify-between py-3 hover:text-brand-600"
            >
              <span class="font-medium">{{ p.name }} <span class="text-xs text-gray-400">/{{ p.subdomain }}</span></span>
              <StatusBadge :active="p.status === 'approved'" :active-label="p.status" :inactive-label="p.status" />
            </NuxtLink>
            <p v-if="!data?.recentPublishers?.length" class="py-6 text-center text-sm text-gray-400">None yet.</p>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="mb-3 font-semibold text-gray-900">Listings by Type</h2>
          <div class="space-y-2">
            <div
              v-for="(count, type) in data?.listingsByType || {}"
              :key="type"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-600">{{ listingTypeLabel(String(type)) }}</span>
              <span class="font-semibold text-gray-900">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
