<script setup lang="ts">
import type { ScheduleEntry } from '~/types';

defineProps<{ entries: ScheduleEntry[] }>();
</script>

<template>
  <div v-if="entries.length" class="divide-y divide-gray-100">
    <div
      v-for="entry in entries"
      :key="entry.id || entry._id"
      class="flex items-center gap-4 py-3"
      :class="entry.status === 'canceled' ? 'opacity-50' : ''"
    >
      <div class="w-12 shrink-0 text-sm font-semibold text-navy-700">
        {{ shortDay(entry.dayOfWeek) }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium text-gray-900">
          {{ entry.locationName }}
          <span v-if="entry.status === 'canceled'" class="text-xs text-red-600">(canceled)</span>
        </p>
        <p v-if="entry.address" class="truncate text-xs text-gray-500">{{ entry.address }}</p>
        <p v-if="entry.notes" class="truncate text-xs italic text-gray-400">{{ entry.notes }}</p>
      </div>
      <div class="shrink-0 text-right text-sm text-gray-600">
        {{ formatRange(entry.startTime, entry.endTime) }}
      </div>
    </div>
  </div>
  <p v-else class="py-6 text-center text-sm text-gray-400">No stops scheduled yet.</p>
</template>
