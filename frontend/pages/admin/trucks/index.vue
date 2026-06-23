<script setup lang="ts">
import type { FoodTruck } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const api = useApi();
const { data: trucks, refresh } = await useAsyncData('admin-trucks', () =>
  api.get<FoodTruck[]>('/admin/trucks'),
);

const search = ref('');
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return trucks.value ?? [];
  return (trucks.value ?? []).filter(
    (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
  );
});

async function patch(t: FoodTruck, body: Partial<FoodTruck>) {
  await api.patch(`/admin/trucks/${t._id}`, body);
  await refresh();
}

async function remove(t: FoodTruck) {
  if (!confirm(`Delete "${t.name}"? This removes the truck and its schedule.`)) return;
  await api.del(`/admin/trucks/${t._id}`);
  await refresh();
}
</script>

<template>
  <div>
    <PageHeader title="Food Trucks" subtitle="Approve, activate, and manage every listing." />

    <div class="p-8">
      <div class="relative mb-4 max-w-sm">
        <Icon
          name="heroicons:magnifying-glass"
          class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
        <input v-model="search" type="search" placeholder="Search trucks…" class="input pl-10" />
      </div>

      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Truck</th>
              <th class="px-4 py-3">Payment</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Featured</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="t in filtered" :key="t._id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <TruckLogo :name="t.name" :logo-url="t.logoUrl" size="sm" />
                  <div>
                    <NuxtLink :to="`/admin/trucks/${t._id}`" class="font-medium text-navy-700 hover:text-brand-600">
                      {{ t.name }}
                    </NuxtLink>
                    <p class="text-xs text-gray-400">{{ t.email || '—' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <select
                  :value="t.paymentStatus"
                  class="input py-1 text-xs"
                  @change="patch(t, { paymentStatus: ($event.target as HTMLSelectElement).value as FoodTruck['paymentStatus'] })"
                >
                  <option value="unpaid">unpaid</option>
                  <option value="paid">paid</option>
                  <option value="trial">trial</option>
                  <option value="comped">comped</option>
                </select>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :active="t.isActive" activeLabel="Live" inactiveLabel="Pending" />
              </td>
              <td class="px-4 py-3">
                <button
                  class="text-lg"
                  :class="t.isFeatured ? 'text-amber-500' : 'text-gray-300'"
                  :title="t.isFeatured ? 'Featured' : 'Not featured'"
                  @click="patch(t, { isFeatured: !t.isFeatured })"
                >
                  ★
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    v-if="!t.isActive"
                    class="btn-primary px-3 py-1 text-xs"
                    @click="patch(t, { isActive: true })"
                  >
                    Approve
                  </button>
                  <button
                    v-else
                    class="btn-secondary px-3 py-1 text-xs"
                    @click="patch(t, { isActive: false })"
                  >
                    Deactivate
                  </button>
                  <NuxtLink :to="`/admin/trucks/${t._id}`" class="btn-secondary px-3 py-1 text-xs">
                    Edit
                  </NuxtLink>
                  <button class="btn-danger px-3 py-1 text-xs" @click="remove(t)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="5" class="px-4 py-12 text-center text-gray-400">No trucks found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
