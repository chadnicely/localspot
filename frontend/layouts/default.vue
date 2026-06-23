<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
onMounted(() => auth.hydrate());

const dashboardLink = computed(() => (auth.isAdmin ? '/admin' : '/dashboard'));
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-40 border-b border-navy-800 bg-navy-900 text-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Icon name="heroicons:truck" class="h-5 w-5" />
          </div>
          <div class="leading-tight">
            <p class="text-xs font-semibold uppercase tracking-wide text-brand-400">North Port</p>
            <p class="-mt-0.5 text-sm font-bold">Food Truck Calendar</p>
          </div>
        </NuxtLink>

        <nav class="flex items-center gap-1 text-sm sm:gap-2">
          <NuxtLink to="/" class="rounded-lg px-3 py-2 hover:bg-white/10">Today</NuxtLink>
          <NuxtLink to="/calendar" class="rounded-lg px-3 py-2 hover:bg-white/10">Calendar</NuxtLink>
          <NuxtLink to="/directory" class="rounded-lg px-3 py-2 hover:bg-white/10">Directory</NuxtLink>
          <NuxtLink
            v-if="auth.isAuthenticated"
            :to="dashboardLink"
            class="btn-primary ml-1"
          >
            My Dashboard
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/login" class="rounded-lg px-3 py-2 hover:bg-white/10">Sign in</NuxtLink>
            <NuxtLink to="/signup" class="btn-primary ml-1">List your truck</NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>© {{ new Date().getFullYear() }} North Port Food Truck Calendar</p>
        <NuxtLink to="/signup" class="font-medium text-brand-600 hover:text-brand-700">
          Get your food truck listed →
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>
