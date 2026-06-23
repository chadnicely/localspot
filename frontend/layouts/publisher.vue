<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useWorkspaceStore } from '~/stores/workspace';

const auth = useAuthStore();
const ws = useWorkspaceStore();
const route = useRoute();
const { calendars, selected } = useCalendars();

const nav = [
  { label: 'Overview', to: '/publisher', icon: 'heroicons:squares-2x2' },
  { label: 'Listings', to: '/publisher/listings', icon: 'heroicons:rectangle-stack' },
  { label: 'Pending Claims', to: '/publisher/claims', icon: 'heroicons:inbox-arrow-down' },
  { label: 'Schedule', to: '/publisher/calendar', icon: 'heroicons:calendar-days' },
  { label: 'Calendars', to: '/publisher/calendars', icon: 'heroicons:rectangle-group' },
  { label: 'White Label', to: '/publisher/branding', icon: 'heroicons:paint-brush' },
];

function isActive(to: string) {
  if (to === '/publisher') return route.path === '/publisher';
  return route.path.startsWith(to);
}
function onSwitch(e: Event) {
  ws.set((e.target as HTMLSelectElement).value);
}
async function logout() {
  auth.logout();
  await navigateTo('/login');
}
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="flex w-64 flex-col border-r border-gray-200 bg-navy-900 text-white">
      <div class="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Icon name="heroicons:building-library" class="h-5 w-5" />
        </div>
        <span class="text-sm font-semibold leading-tight">{{ auth.user?.name }}</span>
      </div>

      <!-- Calendar workspace switcher -->
      <div class="border-b border-white/10 p-3">
        <label class="mb-1 block px-1 text-[11px] uppercase tracking-wide text-navy-300">Calendar</label>
        <select
          v-if="calendars && calendars.length"
          :value="selected?._id"
          class="w-full rounded-lg border border-white/15 bg-white/10 px-2 py-2 text-sm text-white focus:outline-none"
          @change="onSwitch"
        >
          <option v-for="c in calendars" :key="c._id" :value="c._id" class="text-gray-900">
            {{ c.name }}
          </option>
        </select>
        <NuxtLink
          v-else
          to="/publisher/calendars"
          class="block rounded-lg bg-white/10 px-2 py-2 text-center text-sm text-navy-100 hover:bg-white/20"
        >
          ＋ Create your first calendar
        </NuxtLink>
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
        <div class="mb-2 px-3 text-xs text-navy-300">{{ auth.user?.email }}</div>
        <button class="btn-secondary w-full" @click="logout">Sign out</button>
      </div>
    </aside>
    <main class="flex-1 overflow-x-hidden bg-gray-50">
      <slot />
    </main>
  </div>
</template>
