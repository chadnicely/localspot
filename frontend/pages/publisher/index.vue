<script setup lang="ts">
import type { CalendarDashboard, Account } from '~/types';
import { calendarTypeLabel, listingTypeLabel } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const { selected } = useCalendars();
const { data: account } = await useAsyncData('acct', () => api.get<Account>('/me/publisher'));

const { data: dash } = await useAsyncData(
  () => `cal-dash-${selected.value?._id || 'none'}`,
  () =>
    selected.value
      ? api.get<CalendarDashboard>(`/publisher/calendars/${selected.value._id}/dashboard`)
      : Promise.resolve(null),
  { watch: [selected] },
);

const tiles = computed(() => {
  const d = dash.value;
  if (!d) return [];
  return [
    { label: 'Listings', value: d.approvedListings, sub: `${d.totalListings} total`, color: 'text-brand-600' },
    { label: 'Pending', value: d.pendingListings, sub: 'Awaiting approval', color: 'text-amber-600' },
    { label: 'Featured', value: d.featuredListings, sub: 'Highlighted', color: 'text-navy-700' },
    { label: 'Schedule stops', value: d.scheduleStops, sub: 'This week', color: 'text-green-600' },
  ];
});
</script>

<template>
  <div>
    <PageHeader
      :title="selected ? selected.name : 'Welcome'"
      :subtitle="selected ? `${calendarTypeLabel(selected.type)} calendar` : 'Create your first calendar to get started'"
    >
      <template #actions>
        <a v-if="selected" :href="`/${selected.subdomain}`" target="_blank" class="btn-secondary">View public site</a>
      </template>
    </PageHeader>

    <div class="space-y-6 p-8">
      <!-- No calendars yet -->
      <div v-if="!selected" class="card p-8 text-center">
        <Icon name="heroicons:rectangle-group" class="mx-auto h-10 w-10 text-gray-300" />
        <h2 class="mt-3 font-semibold text-gray-900">No calendars yet</h2>
        <p class="mt-1 text-sm text-gray-500">Create your first calendar (e.g. Food Trucks) with its own subdomain.</p>
        <NuxtLink to="/publisher/calendars" class="btn-primary mt-4">Create a calendar</NuxtLink>
      </div>

      <template v-else>
        <!-- White label callout -->
        <div class="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img v-if="account?.logoUrl" :src="account.logoUrl" class="h-full w-full object-cover" />
              <Icon v-else name="heroicons:paint-brush" class="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h2 class="font-semibold text-gray-900">{{ account?.logoUrl ? 'Your white label' : 'Set up your white label' }}</h2>
              <p class="text-sm text-gray-500">Logo + brand colors apply to all your calendars.</p>
            </div>
          </div>
          <NuxtLink to="/publisher/branding" class="btn-primary">
            <Icon name="heroicons:paint-brush" class="h-4 w-4" /> White Label
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
              <span class="badge" :class="l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">{{ l.status }}</span>
            </NuxtLink>
            <p v-if="!dash?.recentListings?.length" class="py-6 text-center text-sm text-gray-400">No listings yet.</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
