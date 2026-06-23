<script setup lang="ts">
import type { CalendarStop } from '~/types';

defineProps<{ stops: CalendarStop[]; pending?: boolean; emptyText?: string }>();
</script>

<template>
  <div>
    <div v-if="pending" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="n in 4" :key="n" class="card h-48 animate-pulse bg-gray-100" />
    </div>

    <div
      v-else-if="stops.length"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <TruckCard
        v-for="stop in stops"
        :key="(stop.id || stop._id) + stop.truck.id"
        :truck="stop.truck"
        :stop="stop"
      />
    </div>

    <div v-else class="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <Icon name="heroicons:face-frown" class="mb-3 h-10 w-10 text-gray-300" />
      <p class="text-gray-500">{{ emptyText ?? 'No food trucks scheduled for this day yet.' }}</p>
      <NuxtLink to="/directory" class="btn-secondary mt-4">Browse all trucks</NuxtLink>
    </div>
  </div>
</template>
