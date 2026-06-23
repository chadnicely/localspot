<script setup lang="ts">
import type { Listing } from '~/types';
import { listingTypeLabel } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const { data: pending, refresh } = await useAsyncData('pub-claims', () =>
  api.get<Listing[]>('/publisher/listings/pending'),
);

async function approve(l: Listing) {
  await api.patch(`/publisher/listings/${l._id}`, { status: 'approved' });
  await refresh();
}
async function reject(l: Listing) {
  if (!confirm(`Reject and delete "${l.name}"?`)) return;
  await api.del(`/publisher/listings/${l._id}`);
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader title="Pending Claims" subtitle="Businesses & vendors waiting for your approval." />
    <div class="max-w-3xl space-y-4 p-8">
      <div v-for="l in pending || []" :key="l._id" class="card flex items-center justify-between p-5">
        <div class="flex items-center gap-3">
          <ListingLogo :name="l.name" :logo-url="l.logoUrl" size="sm" />
          <div>
            <p class="font-semibold text-gray-900">{{ l.name }}</p>
            <p class="text-sm text-gray-500">{{ listingTypeLabel(l.type) }} · {{ l.email }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="`/publisher/listings/${l._id}`" class="btn-secondary px-3 py-1.5 text-sm">View</NuxtLink>
          <button class="btn-primary px-3 py-1.5 text-sm" @click="approve(l)">Approve</button>
          <button class="btn-danger px-3 py-1.5 text-sm" @click="reject(l)">Reject</button>
        </div>
      </div>
      <div v-if="!(pending && pending.length)" class="card px-6 py-16 text-center text-gray-400">
        No pending claims. 🎉
      </div>
    </div>
  </div>
</template>
