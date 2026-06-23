<script setup lang="ts">
import type { PublicProfile } from '~/types';
import { listingTypeLabel } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

definePageMeta({ layout: 'tenant' });

const route = useRoute();
const api = useApi();
const sub = computed(() => String(route.params.hub));
const slug = computed(() => String(route.params.slug));

const { data, error } = await useAsyncData(`profile-${sub.value}-${slug.value}`, () =>
  api.get<PublicProfile>(`/public/${sub.value}/listings/${slug.value}`),
);
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Listing not found', fatal: true });
}

const listing = computed(() => data.value?.listing);
const schedule = computed(() => data.value?.schedule ?? []);

useHead(() => ({ title: listing.value ? listing.value.name : 'Listing' }));

const mapPoints = computed<MapPoint[]>(() =>
  schedule.value
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      lat: s.latitude as number,
      lng: s.longitude as number,
      title: listing.value?.name ?? '',
      subtitle: `${s.locationName} · ${s.dayOfWeek} ${formatRange(s.startTime, s.endTime)}`,
    })),
);

const links = computed(() => {
  const l = listing.value;
  if (!l) return [];
  return [
    { url: l.websiteUrl, label: 'Website', icon: 'heroicons:globe-alt' },
    { url: l.menuUrl, label: 'Menu', icon: 'heroicons:document-text' },
    { url: l.facebookUrl, label: 'Facebook', icon: 'heroicons:hand-thumb-up' },
    { url: l.instagramUrl, label: 'Instagram', icon: 'heroicons:camera' },
  ].filter((x) => x.url);
});
</script>

<template>
  <div v-if="listing" class="mx-auto max-w-5xl px-4 py-8">
    <NuxtLink :to="`/${sub}`" class="text-sm text-gray-500 hover:text-gray-700">← Back to hub</NuxtLink>

    <div class="card mt-3 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
      <ListingLogo :name="listing.name" :logo-url="listing.logoUrl" size="lg" />
      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900">{{ listing.name }}</h1>
          <span v-if="listing.featured" class="badge bg-amber-100 text-amber-700">★ Featured</span>
        </div>
        <p class="mt-1 text-sm text-gray-500">
          {{ listingTypeLabel(listing.type) }}
          <template v-if="listing.category"> · {{ listing.category }}</template>
        </p>
      </div>
      <a v-if="listing.phone" :href="`tel:${listing.phone}`" class="btn-brand"><Icon name="heroicons:phone" class="h-4 w-4" /> {{ listing.phone }}</a>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-1">
        <div class="card p-6">
          <h2 class="mb-2 font-semibold text-gray-900">About</h2>
          <p class="text-sm text-gray-600">{{ listing.description || 'No description provided yet.' }}</p>
          <p v-if="listing.address" class="mt-3 flex items-start gap-1.5 text-sm text-gray-500">
            <Icon name="heroicons:map-pin" class="mt-0.5 h-4 w-4" :style="{ color: 'var(--brand)' }" />
            {{ listing.address }}
          </p>
        </div>
        <div v-if="links.length" class="card p-6">
          <h2 class="mb-3 font-semibold text-gray-900">Find us online</h2>
          <div class="flex flex-col gap-2">
            <a v-for="l in links" :key="l.label" :href="l.url" target="_blank" rel="noopener" class="flex items-center gap-2 text-sm text-gray-700 hover:underline">
              <Icon :name="l.icon" class="h-5 w-5" :style="{ color: 'var(--brand)' }" /> {{ l.label }}
            </a>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="card p-6">
          <h2 class="mb-2 flex items-center gap-2 font-semibold text-gray-900">
            <Icon name="heroicons:calendar-days" class="h-5 w-5" :style="{ color: 'var(--brand)' }" /> This Week's Schedule
          </h2>
          <ScheduleTable :entries="schedule" />
          <ClientOnly>
            <div v-if="mapPoints.length" class="mt-4">
              <TruckMap :points="mapPoints" height="280px" />
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>
