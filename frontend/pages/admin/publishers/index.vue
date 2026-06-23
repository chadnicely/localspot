<script setup lang="ts">
import type { Publisher } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data: publishers, refresh } = await useAsyncData('admin-publishers', () =>
  api.get<Publisher[]>('/admin/publishers'),
);

async function setStatus(p: Publisher, status: string) {
  await api.patch(`/admin/publishers/${p._id}`, { status });
  await refresh();
}
async function remove(p: Publisher) {
  if (!confirm(`Delete hub "${p.name}"? This does not delete its listings' data.`)) return;
  await api.del(`/admin/publishers/${p._id}`);
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader title="Publishers" subtitle="Every local hub on the platform." />
    <div class="p-8">
      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Hub</th>
              <th class="px-4 py-3">Subdomain</th>
              <th class="px-4 py-3">Location</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="p in publishers || []" :key="p._id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-navy-700">{{ p.name }}</td>
              <td class="px-4 py-3">
                <a :href="`/${p.subdomain}`" target="_blank" class="text-brand-600">/{{ p.subdomain }}</a>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ p.city }}, {{ p.state }}</td>
              <td class="px-4 py-3">
                <span
                  class="badge"
                  :class="{
                    'bg-green-100 text-green-700': p.status === 'approved',
                    'bg-amber-100 text-amber-700': p.status === 'pending',
                    'bg-red-100 text-red-700': p.status === 'suspended',
                  }"
                >{{ p.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button v-if="p.status !== 'approved'" class="btn-primary px-3 py-1 text-xs" @click="setStatus(p, 'approved')">Approve</button>
                  <button v-if="p.status === 'approved'" class="btn-secondary px-3 py-1 text-xs" @click="setStatus(p, 'suspended')">Suspend</button>
                  <NuxtLink :to="`/admin/publishers/${p._id}`" class="btn-secondary px-3 py-1 text-xs">Edit</NuxtLink>
                  <button class="btn-danger px-3 py-1 text-xs" @click="remove(p)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="!(publishers && publishers.length)">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">No publishers yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
