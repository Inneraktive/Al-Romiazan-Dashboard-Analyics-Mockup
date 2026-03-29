<script setup lang="ts">
defineProps<{
  name: string
  pct: number
  color: string
  amount: string
  sublabel?: string
  isTotal?: boolean
}>()
</script>

<template>
  <div :class="['progress-row', isTotal ? 'progress-row--total' : '']">
    <div class="progress-row__label">
      <div v-if="!isTotal" class="progress-row__dot" :style="{ background: color }" />
      <div v-else style="width: 10px" />
      <span class="progress-row__name">{{ name }}</span>
    </div>
    <div class="progress-row__bar-container">
      <div class="progress-row__bar-bg">
        <div
          class="progress-row__bar-fill"
          :style="{ width: `${pct}%`, background: isTotal ? '#000' : color }"
        >
          <span v-if="pct > 15" class="progress-row__bar-pct">{{ pct }}%</span>
        </div>
        <span
          v-if="pct <= 15"
          class="progress-row__bar-pct-outside"
          :style="{ left: `${pct + 2}%` }"
        >{{ pct }}%</span>
      </div>
    </div>
    <div class="progress-row__value">
      <div class="progress-row__amount">{{ amount }}</div>
      <div v-if="sublabel" class="progress-row__sublabel">{{ sublabel }}</div>
    </div>
  </div>
</template>
