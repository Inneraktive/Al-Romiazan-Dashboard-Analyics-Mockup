<script setup lang="ts">
import { COLORS } from '~/utils/constants'

const props = withDefaults(defineProps<{
  items: string[]
  colors?: string[]
}>(), { colors: () => COLORS })

const emit = defineEmits<{
  remove: [name: string]
  clear: []
}>()
</script>

<template>
  <div v-if="items.length > 0" class="chips">
    <div
      v-for="(name, i) in items"
      :key="name"
      class="chips__item"
      :style="{
        background: `${(colors || COLORS)[i]}15`,
        color: (colors || COLORS)[i],
        border: `1px solid ${(colors || COLORS)[i]}`,
      }"
      @click="emit('remove', name)"
    >
      <div class="chips__dot" :style="{ background: (colors || COLORS)[i] }" />
      {{ name }}
      <span class="chips__remove">&times;</span>
    </div>
    <button v-if="items.length > 1" class="chips__clear" @click="emit('clear')">Clear all</button>
  </div>
</template>
