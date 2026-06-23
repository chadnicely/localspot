<script setup lang="ts">
const props = defineProps<{
  name: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}>();

const dims = computed(
  () =>
    ({
      sm: 'h-10 w-10 text-sm',
      md: 'h-14 w-14 text-lg',
      lg: 'h-20 w-20 text-2xl',
    })[props.size ?? 'md'],
);

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
);
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-navy-50 font-bold text-navy-700"
    :class="dims"
  >
    <img v-if="logoUrl" :src="logoUrl" :alt="name" class="h-full w-full object-cover" />
    <span v-else>{{ initials }}</span>
  </div>
</template>
