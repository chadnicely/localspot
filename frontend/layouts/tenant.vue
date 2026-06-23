<script setup lang="ts">
import { calendarListingsLabel } from '~/types';

const { subdomain, hub, brand, calendar, error } = useCalendar();

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Calendar not found', fatal: true });
}

const brandStyle = computed(() => ({
  '--brand': brand.value?.primaryColor || '#4f46e5',
  '--brand-dark': brand.value?.secondaryColor || '#1f3559',
}));

const initials = computed(() =>
  (brand.value?.accountName || calendar.value?.name || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);

const nav = computed(() => [
  { label: 'Today', to: `/${subdomain.value}` },
  { label: 'Calendar', to: `/${subdomain.value}/calendar` },
  {
    label: calendar.value ? calendarListingsLabel(calendar.value.type) : 'Directory',
    to: `/${subdomain.value}/directory`,
  },
]);

useHead(() => ({ title: calendar.value ? `${calendar.value.name}` : 'On The Spot' }));
</script>

<template>
  <div class="flex min-h-screen flex-col" :style="brandStyle">
    <header class="sticky top-0 z-40 text-white" style="background: var(--brand-dark)">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink :to="`/${subdomain}`" class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-sm font-bold"
            style="background: var(--brand)"
          >
            <img v-if="brand?.logoUrl" :src="brand.logoUrl" class="h-full w-full object-cover" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="leading-tight">
            <p class="text-sm font-bold">{{ calendar?.name }}</p>
            <p class="-mt-0.5 text-[11px] text-white/60">{{ brand?.accountName }}</p>
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
          <NuxtLink :to="`/${subdomain}/add`" class="btn-brand ml-1">Add yours</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 bg-gray-50">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>{{ brand?.accountName }} · {{ brand?.city }}, {{ brand?.state }}</p>
        <NuxtLink to="/" class="font-medium" :style="{ color: 'var(--brand)' }">Powered by On The Spot →</NuxtLink>
      </div>
    </footer>
  </div>
</template>
