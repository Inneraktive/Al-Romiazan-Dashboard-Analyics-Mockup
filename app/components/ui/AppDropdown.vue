<script setup lang="ts">
const props = withDefaults(defineProps<{
  options: string[]
  modelValue: string
  label?: string
}>(), { label: '' })

const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

const open = ref(false)
const el = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (el.value && !el.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))

function select(opt: string) {
  emit('update:modelValue', opt)
  open.value = false
}
</script>

<template>
  <div ref="el" class="dropdown">
    <span v-if="label" class="dropdown__label">{{ label }}</span>
    <button class="dropdown__trigger" @click="open = !open">
      {{ modelValue }}
      <UiCaretDownIcon />
    </button>
    <div v-if="open" class="dropdown__menu">
      <div
        v-for="opt in options"
        :key="opt"
        :class="['dropdown__option', modelValue === opt ? 'dropdown__option--active' : 'dropdown__option--inactive']"
        @click="select(opt)"
      >
        {{ opt }}
      </div>
    </div>
  </div>
</template>
