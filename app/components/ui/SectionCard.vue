<script setup lang="ts">
defineProps<{
  title: string
  explanation?: string
}>()
</script>

<template>
  <div class="section-card">
    <h3 class="section-card__title">{{ title }}</h3>
    <p v-if="explanation" class="section-card__explanation">{{ explanation }}</p>
    <slot />
  </div>
</template>
