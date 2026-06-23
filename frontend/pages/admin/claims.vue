<script setup lang="ts">
import type { Publisher } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'master' });

const api = useApi();
const { data: publishers, refresh } = await useAsyncData('admin-claims', () =>
  api.get<Publisher[]>('/admin/publishers'),
);

const pending = computed(() => (publishers.value ?? []).filter((p) => p.status === 'pending'));

async function approve(p: Publisher) {
  await api.patch(`/admin/publishers/${p._id}`, { status: 'approved' });
  await refresh();
}
async function reject(p: Publisher) {
  if (!confirm(`Reject and delete "${p.name}"?`)) return;
  await api.del(`/admin/publishers/${p._id}`);
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader title="Pending Publisher Claims" subtitle="Review and approve new local hubs." />
    <div class="max-w-3xl space-y-4 p-8">
      <div v-for="p in pending" :key="p._id" class="card flex items-center justify-between p-5">
        <div>
          <p class="font-semibold text-gray-900">{{ p.name }}</p>
          <p class="text-sm text-gray-500">
            /{{ p.subdomain }} · {{ p.city }}, {{ p.state }} · {{ p.contactEmail }}
          </p>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary px-3 py-1.5 text-sm" @click="approve(p)">Approve</button>
          <button class="btn-danger px-3 py-1.5 text-sm" @click="reject(p)">Reject</button>
        </div>
      </div>
      <div v-if="!pending.length" class="card px-6 py-16 text-center text-gray-400">
        No pending claims. 🎉
      </div>
    </div>
  </div>
</template>
