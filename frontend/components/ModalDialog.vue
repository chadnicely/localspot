<script setup lang="ts">
defineProps<{ title: string; wide?: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
    <div class="card w-full" :class="wide ? 'max-w-3xl' : 'max-w-lg'">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
        <button class="text-gray-400 hover:text-gray-600" @click="emit('close')">✕</button>
      </div>
      <div class="px-6 py-5">
        <slot />
      </div>
      <div v-if="$slots.footer" class="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
