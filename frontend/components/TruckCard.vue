<script setup lang="ts">
import type { CalendarStop, FoodTruck } from '~/types';

const props = defineProps<{
  truck: FoodTruck | CalendarStop['truck'];
  stop?: CalendarStop;
}>();

const slug = computed(() => props.truck.slug);
const categories = computed(() => props.truck.foodCategories?.join(' • ') ?? '');
</script>

<template>
  <div class="card flex flex-col overflow-hidden transition hover:shadow-md">
    <div class="flex items-start gap-3 p-4">
      <TruckLogo :name="truck.name" :logo-url="truck.logoUrl" size="md" />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="truncate font-semibold text-gray-900">{{ truck.name }}</h3>
          <span
            v-if="truck.isFeatured"
            class="badge bg-amber-100 text-amber-700"
            title="Featured truck"
          >
            ★ Featured
          </span>
        </div>
        <p class="truncate text-sm text-gray-500">{{ categories }}</p>
      </div>
    </div>

    <div v-if="stop" class="space-y-1 px-4 pb-3 text-sm text-gray-600">
      <p class="flex items-center gap-1.5">
        <Icon name="heroicons:map-pin" class="h-4 w-4 text-brand-600" />
        {{ stop.locationName }}
      </p>
      <p class="flex items-center gap-1.5">
        <Icon name="heroicons:clock" class="h-4 w-4 text-brand-600" />
        {{ formatRange(stop.startTime, stop.endTime) }}
      </p>
    </div>

    <div class="mt-auto border-t border-gray-100 p-3">
      <NuxtLink :to="`/trucks/${slug}`" class="btn-navy w-full">View Truck</NuxtLink>
    </div>
  </div>
</template>
