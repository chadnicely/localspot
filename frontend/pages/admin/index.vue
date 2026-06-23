<script setup lang="ts">
import type { AdminDashboard } from '~/types';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const api = useApi();
const { data } = await useAsyncData('admin-dashboard', () =>
  api.get<AdminDashboard>('/admin/dashboard'),
);

const tiles = computed(() => {
  const d = data.value;
  if (!d) return [];
  return [
    { label: 'Active', value: d.activeTrucks, sub: 'Total trucks', color: 'text-navy-700' },
    { label: 'Trucks paid', value: d.paidTrucks, sub: 'Paid this week', color: 'text-green-600' },
    { label: 'Pending approval', value: d.pendingTrucks, sub: 'Awaiting activation', color: 'text-amber-600' },
    { label: 'Weekly revenue', value: `$${d.weeklyRevenue.toLocaleString()}`, sub: 'This week', color: 'text-brand-600' },
  ];
});
</script>

<template>
  <div>
    <PageHeader title="Admin Dashboard" subtitle="Manage listings and promote the calendar." />

    <div class="space-y-6 p-8">
      <!-- Stat tiles -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="t in tiles" :key="t.label" class="card p-5">
          <p class="text-3xl font-bold" :class="t.color">{{ t.value }}</p>
          <p class="mt-1 text-sm font-medium text-gray-700">{{ t.label }}</p>
          <p class="text-xs text-gray-400">{{ t.sub }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Recent activity -->
        <div class="card p-6 lg:col-span-2">
          <h2 class="mb-3 font-semibold text-gray-900">Recent Truck Activity</h2>
          <div class="divide-y divide-gray-100">
            <div
              v-for="t in data?.recentTrucks || []"
              :key="t.id"
              class="flex items-center justify-between py-3"
            >
              <NuxtLink :to="`/admin/trucks/${t.id}`" class="font-medium text-navy-700 hover:text-brand-600">
                {{ t.name }}
              </NuxtLink>
              <div class="flex items-center gap-2">
                <span
                  class="badge"
                  :class="t.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                >
                  {{ t.paymentStatus }}
                </span>
                <StatusBadge :active="t.isActive" activeLabel="Live" inactiveLabel="Pending" />
              </div>
            </div>
            <p v-if="!data?.recentTrucks?.length" class="py-6 text-center text-sm text-gray-400">
              No trucks yet.
            </p>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="card p-6">
          <h2 class="mb-3 font-semibold text-gray-900">Quick Actions</h2>
          <div class="space-y-2">
            <NuxtLink to="/admin/trucks" class="btn-primary w-full">
              <Icon name="heroicons:truck" class="h-4 w-4" /> Manage all trucks
            </NuxtLink>
            <NuxtLink to="/admin/schedule" class="btn-secondary w-full">
              <Icon name="heroicons:calendar-days" class="h-4 w-4" /> View full schedule
            </NuxtLink>
            <NuxtLink to="/" target="_blank" class="btn-secondary w-full">
              <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" /> Open public calendar
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
