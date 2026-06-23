<script setup lang="ts">
import type { Calendar } from '~/types';
import { calendarTypeLabel } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data: calendars } = await useAsyncData('admin-calendars', () =>
  api.get<Calendar[]>('/admin/calendars'),
);
</script>

<template>
  <div>
    <PageHeader title="Calendars" subtitle="Every calendar site across all accounts." />
    <div class="p-8">
      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Calendar</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Subdomain</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in calendars || []" :key="c._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-navy-700">{{ c.name }}</td>
              <td class="px-4 py-3">{{ calendarTypeLabel(c.type) }}</td>
              <td class="px-4 py-3">
                <a :href="`/${c.subdomain}`" target="_blank" class="text-brand-600">/{{ c.subdomain }}</a>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :active="c.active" active-label="Live" inactive-label="Off" />
              </td>
            </tr>
            <tr v-if="!(calendars && calendars.length)">
              <td colspan="4" class="px-4 py-12 text-center text-gray-400">No calendars yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
