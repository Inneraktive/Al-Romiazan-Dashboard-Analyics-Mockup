<script setup lang="ts">
withDefaults(defineProps<{ color?: string }>(), { color: '#589e67' })
</script>

<template>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 4.5L8.5 10L6 7.5L2 11.5" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10.5 4.5H14V8" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
