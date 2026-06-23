<script setup lang="ts">
import type { PublicProfile } from '~/types';
import type { MapPoint } from '~/components/TruckMap.client.vue';

const route = useRoute();
const api = useApi();
const slug = computed(() => String(route.params.slug));

const { data, error } = await useAsyncData(
  () => `truck-${slug.value}`,
  () => api.get<PublicProfile>(`/public/trucks/${slug.value}`),
);

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Food truck not found', fatal: true });
}

const truck = computed(() => data.value?.truck);
const schedule = computed(() => data.value?.schedule ?? []);

useHead(() => ({ title: truck.value ? `${truck.value.name} · Food Truck Calendar` : 'Food Truck' }));

const mapPoints = computed<MapPoint[]>(() =>
  schedule.value
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      lat: s.latitude as number,
      lng: s.longitude as number,
      title: truck.value?.name ?? '',
      subtitle: `${s.locationName} · ${s.dayOfWeek} ${formatRange(s.startTime, s.endTime)}`,
    })),
);

const links = computed(() => {
  const t = truck.value;
  if (!t) return [];
  return [
    { url: t.websiteUrl, label: 'Website', icon: 'heroicons:globe-alt' },
    { url: t.menuUrl, label: 'Menu', icon: 'heroicons:document-text' },
    { url: t.facebookUrl, label: 'Facebook', icon: 'heroicons:hand-thumb-up' },
    { url: t.instagramUrl, label: 'Instagram', icon: 'heroicons:camera' },
  ].filter((l) => l.url);
});
</script>

<template>
  <div v-if="truck">
    <!-- Cover -->
    <div class="bg-navy-900">
      <div class="mx-auto max-w-5xl px-4 pb-0 pt-4">
        <NuxtLink to="/directory" class="text-sm text-navy-200 hover:text-white">
          ← Back to directory
        </NuxtLink>
      </div>
      <div
        class="mx-auto mt-3 flex h-44 max-w-5xl items-center justify-center overflow-hidden px-4"
      >
        <img
          v-if="truck.mainImageUrl"
          :src="truck.mainImageUrl"
          :alt="truck.name"
          class="h-full w-full rounded-t-xl object-cover"
        />
      </div>
    </div>

    <div class="mx-auto max-w-5xl px-4 pb-12">
      <!-- Header card -->
      <div class="card -mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <TruckLogo :name="truck.name" :logo-url="truck.logoUrl" size="lg" />
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-900">{{ truck.name }}</h1>
            <span v-if="truck.isFeatured" class="badge bg-amber-100 text-amber-700">★ Featured</span>
          </div>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <span
              v-for="c in truck.foodCategories"
              :key="c"
              class="badge bg-brand-50 text-brand-700"
            >
              {{ c }}
            </span>
          </div>
        </div>
        <a v-if="truck.phone" :href="`tel:${truck.phone}`" class="btn-primary">
          <Icon name="heroicons:phone" class="h-4 w-4" /> {{ truck.phone }}
        </a>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- About + links -->
        <div class="space-y-6 lg:col-span-1">
          <div class="card p-6">
            <h2 class="mb-2 font-semibold text-gray-900">About</h2>
            <p class="text-sm text-gray-600">
              {{ truck.description || 'No description provided yet.' }}
            </p>
          </div>
          <div v-if="links.length" class="card p-6">
            <h2 class="mb-3 font-semibold text-gray-900">Find us online</h2>
            <div class="flex flex-col gap-2">
              <a
                v-for="l in links"
                :key="l.label"
                :href="l.url"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-2 text-sm text-navy-700 hover:text-brand-600"
              >
                <Icon :name="l.icon" class="h-5 w-5" /> {{ l.label }}
              </a>
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <h2 class="mb-2 flex items-center gap-2 font-semibold text-gray-900">
              <Icon name="heroicons:calendar-days" class="h-5 w-5 text-brand-600" />
              This Week's Schedule
            </h2>
            <ScheduleTable :entries="schedule" />

            <ClientOnly>
              <div v-if="mapPoints.length" class="mt-4">
                <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Icon name="heroicons:map" class="h-4 w-4 text-brand-600" /> Where to find us
                </h3>
                <TruckMap :points="mapPoints" height="280px" />
              </div>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
