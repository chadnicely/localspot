<script setup lang="ts">
import type { Listing } from '~/types';
import { listingTypeLabel } from '~/types';

definePageMeta({ layout: 'publisher', middleware: 'publisher' });

const api = useApi();
const { selected } = useCalendars();

const { data: listings, refresh } = await useAsyncData(
  () => `cal-listings-${selected.value?._id || 'none'}`,
  () =>
    selected.value
      ? api.get<Listing[]>(`/publisher/calendars/${selected.value._id}/listings`)
      : Promise.resolve([] as Listing[]),
  { watch: [selected], default: () => [] as Listing[] },
);

async function patch(l: Listing, body: Partial<Listing>) {
  await api.patch(`/publisher/listings/${l._id}`, body);
  await refresh();
}
async function remove(l: Listing) {
  if (!confirm(`Delete "${l.name}"?`)) return;
  await api.del(`/publisher/listings/${l._id}`);
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader :title="`Listings`" :subtitle="selected ? `In ${selected.name}` : ''">
      <template #actions>
        <NuxtLink v-if="selected" to="/publisher/listings/new" class="btn-primary">
          <Icon name="heroicons:plus" class="h-4 w-4" /> Add listing
        </NuxtLink>
      </template>
    </PageHeader>

    <div class="p-8">
      <div v-if="!selected" class="card px-6 py-16 text-center text-gray-400">
        Create a calendar first.
      </div>
      <div v-else class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Listing</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Featured</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="l in listings || []" :key="l._id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <ListingLogo :name="l.name" :logo-url="l.logoUrl" size="sm" />
                  <span class="font-medium text-navy-700">{{ l.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="badge" :class="{
                  'bg-green-100 text-green-700': l.status === 'approved',
                  'bg-amber-100 text-amber-700': l.status === 'pending',
                  'bg-red-100 text-red-700': l.status === 'suspended',
                }">{{ l.status }}</span>
              </td>
              <td class="px-4 py-3">
                <button class="text-lg" :class="l.featured ? 'text-amber-500' : 'text-gray-300'" @click="patch(l, { featured: !l.featured })">★</button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button v-if="l.status !== 'approved'" class="btn-primary px-3 py-1 text-xs" @click="patch(l, { status: 'approved' })">Approve</button>
                  <button v-else class="btn-secondary px-3 py-1 text-xs" @click="patch(l, { status: 'suspended' })">Suspend</button>
                  <NuxtLink :to="`/publisher/listings/${l._id}`" class="btn-secondary px-3 py-1 text-xs">Edit</NuxtLink>
                  <button class="btn-danger px-3 py-1 text-xs" @click="remove(l)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="!(listings && listings.length)">
              <td colspan="4" class="px-4 py-12 text-center text-gray-400">No listings in this calendar yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
