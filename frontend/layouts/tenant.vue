<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const { subdomain, hub, error } = usePublisher();
const auth = useAuthStore();
onMounted(() => auth.hydrate());

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Local hub not found', fatal: true });
}

const brandStyle = computed(() => ({
  '--brand': hub.value?.primaryColor || '#4f46e5',
  '--brand-dark': hub.value?.secondaryColor || '#1f3559',
}));

const nav = computed(() => [
  { label: 'Today', to: `/${subdomain.value}` },
  { label: 'Calendar', to: `/${subdomain.value}/calendar` },
  { label: 'Food Trucks', to: `/${subdomain.value}/food-trucks` },
  { label: 'Businesses', to: `/${subdomain.value}/businesses` },
]);

useHead(() => ({ title: hub.value ? `${hub.value.name} · On The Spot` : 'On The Spot' }));
</script>

<template>
  <div class="flex min-h-screen flex-col" :style="brandStyle">
    <header class="sticky top-0 z-40 text-white" style="background: var(--brand-dark)">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink :to="`/${subdomain}`" class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg"
            style="background: var(--brand)"
          >
            <img v-if="hub?.logoUrl" :src="hub.logoUrl" class="h-full w-full object-cover" />
            <Icon v-else name="heroicons:map-pin" class="h-5 w-5" />
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold">{{ hub?.name }}</p>
            <p class="-mt-0.5 text-[11px] text-white/60">powered by On The Spot</p>
          </div>
        </NuxtLink>

        <nav class="flex items-center gap-1 text-sm">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-2 hover:bg-white/10"
          >
            {{ item.label }}
          </NuxtLink>
          <NuxtLink :to="`/${subdomain}/add`" class="btn-brand ml-1">Add your business</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 bg-gray-50">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>{{ hub?.name }} · {{ hub?.city }}, {{ hub?.state }}</p>
        <NuxtLink to="/" class="font-medium" :style="{ color: 'var(--brand)' }">
          Powered by On The Spot →
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>
