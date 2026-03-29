<script setup lang="ts">
import { C } from '~/utils/constants'

const props = defineProps<{
  value: number
  highlight?: 'best' | 'worst'
}>()

const intensity = computed(() => Math.min(props.value / 180, 1))

const bgColor = computed(() => {
  if (props.highlight === 'best') return C.green
  if (props.highlight === 'worst') return C.red
  return `rgba(0,0,0,${intensity.value * 0.75 + 0.05})`
})

const textColor = computed(() => {
  if (props.highlight || intensity.value > 0.35) return '#fff'
  return C.textMuted
})

const fontWeight = computed(() => {
  if (props.highlight || intensity.value > 0.5) return 700
  return 400
})
</script>

<template>
  <div class="heatmap-cell" :style="{ background: bgColor, color: textColor, fontWeight }">
    {{ value }}
  </div>
</template>
