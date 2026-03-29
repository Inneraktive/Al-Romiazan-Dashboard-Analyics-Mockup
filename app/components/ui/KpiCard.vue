<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  change?: number
  prefix?: string
}>()
</script>

<template>
  <div class="kpi-card">
    <div class="kpi-card__label">{{ label }}</div>
    <div class="kpi-card__value">{{ prefix }}{{ value }}</div>
    <div
      v-if="change !== undefined"
      :class="['kpi-card__change', change > 0 ? 'kpi-card__change--positive' : 'kpi-card__change--negative']"
    >
      {{ change > 0 ? '+' : '' }}{{ change }}% vs prev period
    </div>
  </div>
</template>
