<script setup lang="ts">
const props = withDefaults(defineProps<{
  options: string[]
  modelValue: string[]
  label?: string
  max?: number
}>(), { label: '', max: 6 })

const emit = defineEmits<{ 'update:modelValue': [val: string[]] }>()

const open = ref(false)
const search = ref('')
const el = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (el.value && !el.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))

const filtered = computed(() =>
  props.options.filter(o => o.toLowerCase().includes(search.value.toLowerCase()))
)

function toggle(opt: string) {
  const isSelected = props.modelValue.includes(opt)
  if (!isSelected && props.modelValue.length >= props.max) return
  const next = isSelected
    ? props.modelValue.filter(x => x !== opt)
    : [...props.modelValue, opt]
  emit('update:modelValue', next)
}
</script>

<template>
  <div ref="el" class="multi-dropdown">
    <div
      :class="['multi-dropdown__trigger', open ? 'multi-dropdown__trigger--open' : 'multi-dropdown__trigger--closed']"
      @click="open = !open"
    >
      <input
        v-model="search"
        class="multi-dropdown__input"
        :placeholder="`${label} (${modelValue.length}/${max})`"
        @click.stop
        @input="open = true"
      />
      <UiCaretDownIcon />
    </div>
    <div v-if="open" class="multi-dropdown__menu">
      <div
        v-for="opt in filtered"
        :key="opt"
        :class="[
          'multi-dropdown__option',
          modelValue.includes(opt) ? 'multi-dropdown__option--selected' : '',
          !modelValue.includes(opt) && modelValue.length >= max ? 'multi-dropdown__option--disabled' : '',
        ]"
        @click="toggle(opt)"
      >
        <div :class="['multi-dropdown__checkbox', modelValue.includes(opt) ? 'multi-dropdown__checkbox--checked' : 'multi-dropdown__checkbox--unchecked']">
          <span v-if="modelValue.includes(opt)" style="color: #fff; font-size: 10px; font-weight: 700">✓</span>
        </div>
        <span style="font-size: 14px">{{ opt }}</span>
      </div>
      <div v-if="filtered.length === 0" class="multi-dropdown__empty">No results</div>
    </div>
  </div>
</template>
