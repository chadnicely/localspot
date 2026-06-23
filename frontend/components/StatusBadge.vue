<script setup lang="ts">
const props = defineProps<{ active: boolean; activeLabel?: string; inactiveLabel?: string }>();
</script>

<template>
  <span
    class="badge"
    :class="props.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
  >
    {{ props.active ? (activeLabel ?? 'Active') : (inactiveLabel ?? 'Inactive') }}
  </span>
</template>
