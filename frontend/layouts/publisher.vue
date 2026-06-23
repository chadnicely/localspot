<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
const route = useRoute();

const nav = [
  { label: 'Overview', to: '/publisher', icon: 'heroicons:squares-2x2' },
  { label: 'Listings', to: '/publisher/listings', icon: 'heroicons:rectangle-stack' },
  { label: 'Pending Claims', to: '/publisher/claims', icon: 'heroicons:inbox-arrow-down' },
  { label: 'Calendar', to: '/publisher/calendar', icon: 'heroicons:calendar-days' },
  { label: 'Branding', to: '/publisher/branding', icon: 'heroicons:paint-brush' },
];

function isActive(to: string) {
  if (to === '/publisher') return route.path === '/publisher';
  return route.path.startsWith(to);
}

async function logout() {
  auth.logout();
  await navigateTo('/login');
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="flex w-60 flex-col border-r border-gray-200 bg-navy-900 text-white">
      <div class="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Icon name="heroicons:building-library" class="h-5 w-5" />
        </div>
        <span class="text-sm font-semibold leading-tight">Publisher<br />Dashboard</span>
      </div>
      <nav class="flex-1 space-y-1 p-3">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="isActive(item.to) ? 'bg-brand-600 text-white' : 'text-navy-100 hover:bg-white/10'"
        >
          <Icon :name="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="border-t border-white/10 p-3">
        <div class="mb-2 px-3 text-xs text-navy-200">
          {{ auth.user?.name }}<br />
          <span class="text-navy-300">{{ auth.user?.email }}</span>
        </div>
        <button class="btn-secondary w-full" @click="logout">Sign out</button>
      </div>
    </aside>
    <main class="flex-1 overflow-x-hidden bg-gray-50">
      <slot />
    </main>
  </div>
</template>
