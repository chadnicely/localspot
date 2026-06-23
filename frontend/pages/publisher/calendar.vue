<script setup lang="ts">
import type { CalendarStop } from '~/types';
import { DAYS_OF_WEEK } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const day = ref('');

const { data: entries, pending } = await useAsyncData(
  'pub-schedule',
  () => api.get<CalendarStop[]>(`/publisher/schedule${day.value ? `?day=${day.value}` : ''}`),
  { watch: [day], default: () => [] as CalendarStop[] },
);
</script>

<template>
  <div>
    <PageHeader title="Hub Calendar" subtitle="Every scheduled stop across your listings." />
    <div class="p-8">
      <div class="mb-4 flex flex-wrap gap-2">
        <button class="chip" :class="day === '' ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white text-gray-600'" @click="day = ''">All days</button>
        <button v-for="d in DAYS_OF_WEEK" :key="d" class="chip" :class="day === d ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white text-gray-600'" @click="day = d">{{ shortDay(d) }}</button>
      </div>

      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Day</th>
              <th class="px-4 py-3">Listing</th>
              <th class="px-4 py-3">Location</th>
              <th class="px-4 py-3">Time</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="e in entries || []" :key="e.id || e._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-navy-700">{{ shortDay(e.dayOfWeek) }}</td>
              <td class="px-4 py-3">{{ e.listing?.name }}</td>
              <td class="px-4 py-3">{{ e.locationName }}</td>
              <td class="px-4 py-3">{{ formatRange(e.startTime, e.endTime) }}</td>
              <td class="px-4 py-3">
                <span class="badge" :class="e.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">{{ e.status }}</span>
              </td>
            </tr>
            <tr v-if="!pending && !(entries && entries.length)">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">No schedule entries.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
