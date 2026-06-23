<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
onMounted(() => auth.hydrate());
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Icon name="heroicons:map-pin" class="h-5 w-5" />
          </div>
          <span class="text-lg font-bold tracking-tight text-gray-900">On The Spot</span>
        </NuxtLink>

        <nav class="flex items-center gap-1 text-sm sm:gap-2">
          <NuxtLink
            v-if="auth.isAuthenticated"
            :to="auth.home"
            class="btn-primary"
          >
            My Dashboard
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/login" class="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50">
              Sign in
            </NuxtLink>
            <NuxtLink to="/claim" class="btn-primary">Claim Your Hub</NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
        © {{ new Date().getFullYear() }} On The Spot — local discovery for newsletter publishers.
      </div>
    </footer>
  </div>
</template>
