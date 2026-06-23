<script setup lang="ts">
import type { FoodTruck } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'auth' });

const api = useApi();
const { data: truck } = await useAsyncData('billing-truck', () => api.get<FoodTruck>('/me/truck'));

const planLabel: Record<string, string> = {
  weekly: '$10 / week',
  featured: '$15 / week (Featured)',
  monthly: '$49 / month',
};
</script>

<template>
  <div>
    <PageHeader title="Billing & Subscription" subtitle="Your listing plan and payment status." />
    <div class="max-w-2xl p-8">
      <div class="card divide-y divide-gray-100">
        <div class="flex items-center justify-between px-6 py-4">
          <span class="text-sm text-gray-500">Plan</span>
          <span class="font-medium text-gray-900">{{ planLabel[truck?.plan || 'weekly'] }}</span>
        </div>
        <div class="flex items-center justify-between px-6 py-4">
          <span class="text-sm text-gray-500">Payment status</span>
          <span
            class="badge"
            :class="truck?.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ truck?.paymentStatus || '—' }}
          </span>
        </div>
        <div class="flex items-center justify-between px-6 py-4">
          <span class="text-sm text-gray-500">Listing</span>
          <StatusBadge :active="!!truck?.isActive" activeLabel="Live" inactiveLabel="Pending activation" />
        </div>
      </div>
      <p class="mt-4 text-sm text-gray-500">
        Payments are handled manually for now. Contact the site admin to update your plan or
        confirm payment — your listing activates as soon as payment is recorded.
      </p>
    </div>
  </div>
</template>
