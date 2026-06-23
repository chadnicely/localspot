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
      class="chip"
      :class="
        props.active === today
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-navy-200 bg-white text-navy-700 hover:bg-navy-50'
      "
      @click="emit('select', today)"
    >
      Today
    </button>
    <button
      v-for="day in DAYS_OF_WEEK"
      :key="day"
      class="chip"
      :class="
        props.active === day
          ? 'border-navy-700 bg-navy-700 text-white'
          : 'border-navy-200 bg-white text-navy-700 hover:bg-navy-50'
      "
      @click="emit('select', day)"
    >
      {{ shortDay(day) }}
    </button>
  </div>
</template>
