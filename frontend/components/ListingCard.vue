<script setup lang="ts">
import type { CalendarStop, Listing, ListingSummary } from '~/types';
import { listingTypeLabel } from '~/types';

const props = defineProps<{
  /** Either a full Listing (directory) or a ListingSummary (calendar). */
  listing: Listing | ListingSummary;
  stop?: CalendarStop;
  sub: string;
}>();

const meta = computed(() => {
  const l: any = props.listing;
  return l.cuisineType || l.category || listingTypeLabel(l.type);
});
</script>

<template>
  <div class="card flex flex-col overflow-hidden transition hover:shadow-md">
    <div class="flex items-start gap-3 p-4">
      <ListingLogo :name="listing.name" :logo-url="listing.logoUrl" size="md" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="truncate font-semibold text-gray-900">{{ listing.name }}</h3>
          <span v-if="listing.featured" class="badge bg-amber-100 text-amber-700">★</span>
        </div>
        <p class="truncate text-sm text-gray-500">{{ meta }}</p>
        <span class="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
          {{ listingTypeLabel((listing as any).type) }}
        </span>
      </div>
    </div>

    <div v-if="stop" class="space-y-1 px-4 pb-3 text-sm text-gray-600">
      <p class="flex items-center gap-1.5">
        <Icon name="heroicons:map-pin" class="h-4 w-4" :style="{ color: 'var(--brand)' }" />
        {{ stop.locationName }}
      </p>
      <p class="flex items-center gap-1.5">
        <Icon name="heroicons:clock" class="h-4 w-4" :style="{ color: 'var(--brand)' }" />
        {{ formatRange(stop.startTime, stop.endTime) }}
      </p>
    </div>

    <div class="mt-auto border-t border-gray-100 p-3">
      <NuxtLink :to="`/${sub}/listings/${listing.slug}`" class="btn-brand w-full">
        View
      </NuxtLink>
    </div>
  </div>
</template>
