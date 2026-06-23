<script setup lang="ts">
import type { FoodTruck } from '~/types';

definePageMeta({ layout: 'owner', middleware: 'auth' });

const api = useApi();
const { data: truck } = await useAsyncData('preview-truck', () => api.get<FoodTruck>('/me/truck'));

const publicPath = computed(() => (truck.value ? `/trucks/${truck.value.slug}` : '/'));
</script>

<template>
  <div>
    <PageHeader title="Preview Public Page" subtitle="See exactly what visitors see." />
    <div class="max-w-2xl p-8">
      <div class="card p-6">
        <p class="text-sm text-gray-500">Your public page URL</p>
        <p class="mt-1 break-all font-mono text-sm text-navy-700">
          northportmatters.com{{ publicPath }}
        </p>
        <div class="mt-5 flex gap-3">
          <NuxtLink :to="publicPath" target="_blank" class="btn-primary">
            <Icon name="heroicons:arrow-top-right-on-square" class="h-4 w-4" /> Open public page
          </NuxtLink>
          <NuxtLink to="/dashboard/profile" class="btn-secondary">Edit profile</NuxtLink>
        </div>
        <p v-if="truck && !truck.isActive" class="mt-4 text-sm text-amber-700">
          Note: your page is only visible to the public once an admin activates your listing.
        </p>
      </div>
    </div>
  </div>
</template>
