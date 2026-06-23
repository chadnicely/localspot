<script setup lang="ts">
import { DAYS_OF_WEEK } from '~/types';

const props = defineProps<{ active: string; includeToday?: boolean }>();
const emit = defineEmits<{ select: [day: string] }>();

const today = todayName();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-if="includeToday"
      class="chip border-transparent"
      :class="props.active === today ? 'text-white' : 'bg-white/10 text-white hover:bg-white/20'"
      :style="props.active === today ? { background: 'var(--brand)' } : {}"
      @click="emit('select', today)"
    >
      Today
    </button>
    <button
      v-for="day in DAYS_OF_WEEK"
      :key="day"
      class="chip border-transparent"
      :class="props.active === day ? 'text-white' : 'bg-white/10 text-white hover:bg-white/20'"
      :style="props.active === day ? { background: 'var(--brand-dark)' } : {}"
      @click="emit('select', day)"
    >
      {{ shortDay(day) }}
    </button>
  </div>
</template>
