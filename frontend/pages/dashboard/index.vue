<script setup lang="ts">
import type { FoodTruck, ScheduleEntry } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'auth' });

const api = useApi();

const { data: truck } = await useAsyncData('my-truck', () => api.get<FoodTruck>('/me/truck'));
const { data: schedule } = await useAsyncData('my-schedule', () =>
  api.get<ScheduleEntry[]>('/me/truck/schedule'),
);

const stopsCount = computed(() => (schedule.value ?? []).filter((s) => s.status !== 'canceled').length);
const isLive = computed(() => truck.value?.isActive && truck.value?.paymentStatus !== 'unpaid');
</script>

<template>
  <div>
    <PageHeader :title="`Welcome back, ${truck?.name || 'Truck Owner'}!`" subtitle="Your food truck dashboard">
      <template #actions>
        <NuxtLink v-if="truck" :to="`/trucks/${truck.slug}`" target="_blank" class="btn-secondary">
          View public page
        </NuxtLink>
      </template>
    </PageHeader>

    <div class="space-y-6 p-8">
      <!-- Approval / payment banner -->
      <div
        v-if="!isLive"
        class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        <Icon name="heroicons:exclamation-triangle" class="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p class="font-medium">Your listing isn't live yet.</p>
          <p>
            An admin will activate your truck once your payment is confirmed. You can still set up
            your profile and schedule now — they'll go live automatically.
          </p>
        </div>
      </div>

      <!-- Stat tiles -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="card p-5">
          <p class="text-3xl font-bold text-brand-600">{{ stopsCount }}</p>
          <p class="mt-1 text-sm text-gray-500">Scheduled stops</p>
        </div>
        <div class="card p-5">
          <p class="text-3xl font-bold text-navy-700">{{ truck?.foodCategories.length || 0 }}</p>
          <p class="mt-1 text-sm text-gray-500">Food categories</p>
        </div>
        <div class="card p-5">
          <StatusBadge :active="!!truck?.isActive" activeLabel="Live" inactiveLabel="Pending" />
          <p class="mt-2 text-sm text-gray-500">Listing status</p>
        </div>
        <div class="card p-5">
          <span class="badge" :class="truck?.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            {{ truck?.paymentStatus || '—' }}
          </span>
          <p class="mt-2 text-sm text-gray-500">Payment</p>
        </div>
      </div>

      <!-- This week's schedule -->
      <div class="card p-6">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">This Week's Schedule</h2>
          <NuxtLink to="/dashboard/schedule" class="btn-primary">
            <Icon name="heroicons:plus" class="h-4 w-4" /> Manage stops
          </NuxtLink>
        </div>
        <ScheduleTable :entries="schedule || []" />
      </div>
    </div>
  </div>
</template>
