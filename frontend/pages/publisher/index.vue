<script setup lang="ts">
import type { PublisherDashboard, Publisher } from '~/types';
import { listingTypeLabel } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const [{ data: dash }, { data: hub }] = await Promise.all([
  useAsyncData('pub-dashboard', () => api.get<PublisherDashboard>('/publisher/dashboard')),
  useAsyncData('pub-self', () => api.get<Publisher>('/me/publisher')),
]);

const tiles = computed(() => {
  const d = dash.value;
  if (!d) return [];
  return [
    { label: 'Listings', value: d.approvedListings, sub: `${d.totalListings} total`, color: 'text-brand-600' },
    { label: 'Pending', value: d.pendingListings, sub: 'Awaiting your approval', color: 'text-amber-600' },
    { label: 'Featured', value: d.featuredListings, sub: 'Highlighted', color: 'text-navy-700' },
    { label: 'Schedule stops', value: d.scheduleStops, sub: 'This week', color: 'text-green-600' },
  ];
});
</script>

<template>
  <div>
    <PageHeader :title="`Welcome, ${hub?.name || 'Publisher'}`" :subtitle="hub ? `Your hub: /${hub.subdomain}` : ''">
      <template #actions>
        <a v-if="hub" :href="`/${hub.subdomain}`" target="_blank" class="btn-secondary">View public hub</a>
      </template>
    </PageHeader>

    <div class="space-y-6 p-8">
      <div
        v-if="hub && hub.status !== 'approved'"
        class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        Your hub is <strong>{{ hub.status }}</strong> — it isn't public yet. A platform admin will
        approve it shortly.
      </div>

      <!-- White-label setup callout -->
      <div class="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <img v-if="hub?.logoUrl" :src="hub.logoUrl" class="h-full w-full object-cover" />
            <Icon v-else name="heroicons:paint-brush" class="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 class="font-semibold text-gray-900">
              {{ hub?.logoUrl ? 'Your white-label hub' : 'Set up your white-label hub' }}
            </h2>
            <p class="text-sm text-gray-500">
              Your site:
              <a v-if="hub" :href="`/${hub.subdomain}`" target="_blank" class="font-medium text-brand-600">
                {{ hub.subdomain }}.onthespot.com
              </a>
            </p>
            <p v-if="!hub?.logoUrl" class="mt-1 text-xs text-amber-600">
              Add your logo and brand colours to finish setup.
            </p>
          </div>
        </div>
        <NuxtLink to="/publisher/branding" class="btn-primary">
          <Icon name="heroicons:paint-brush" class="h-4 w-4" />
          {{ hub?.logoUrl ? 'Edit hub setup' : 'Set up my hub' }}
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="t in tiles" :key="t.label" class="card p-5">
          <p class="text-3xl font-bold" :class="t.color">{{ t.value }}</p>
          <p class="mt-1 text-sm font-medium text-gray-700">{{ t.label }}</p>
          <p class="text-xs text-gray-400">{{ t.sub }}</p>
        </div>
      </div>

      <div class="card p-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Recent Listings</h2>
          <NuxtLink to="/publisher/listings" class="text-sm text-brand-600">Manage all</NuxtLink>
        </div>
        <div class="divide-y divide-gray-100">
          <NuxtLink
            v-for="l in dash?.recentListings || []"
            :key="l.id"
            :to="`/publisher/listings/${l.id}`"
            class="flex items-center justify-between py-3 hover:text-brand-600"
          >
            <span class="font-medium">{{ l.name }}
              <span class="ml-1 text-xs text-gray-400">{{ listingTypeLabel(l.type) }}</span>
            </span>
            <span
              class="badge"
              :class="l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
            >{{ l.status }}</span>
          </NuxtLink>
          <p v-if="!dash?.recentListings?.length" class="py-6 text-center text-sm text-gray-400">
            No listings yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
