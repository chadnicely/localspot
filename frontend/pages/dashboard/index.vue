<script setup lang="ts">
import type { Listing } from '~/types';
import { listingTypeLabel } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'owner' });

const api = useApi();
const { data: listings } = await useAsyncData('my-listings', () => api.get<Listing[]>('/me/listings'));
</script>

<template>
  <div>
    <PageHeader title="My Listings" subtitle="Manage your profiles and schedules." />
    <div class="p-8">
      <div v-if="listings && listings.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="l in listings"
          :key="l._id"
          :to="`/dashboard/listings/${l._id}`"
          class="card flex items-center gap-4 p-5 transition hover:shadow-md"
        >
          <ListingLogo :name="l.name" :logo-url="l.logoUrl" size="md" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-gray-900">{{ l.name }}</p>
            <p class="text-sm text-gray-500">{{ listingTypeLabel(l.type) }}</p>
            <span
              class="badge mt-1"
              :class="l.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
            >{{ l.status === 'approved' ? 'Live' : l.status }}</span>
          </div>
          <Icon name="heroicons:chevron-right" class="h-5 w-5 text-gray-300" />
        </NuxtLink>
      </div>
      <div v-else class="card px-6 py-16 text-center text-gray-400">
        You don't have any listings yet.
      </div>
    </div>
  </div>
</template>
