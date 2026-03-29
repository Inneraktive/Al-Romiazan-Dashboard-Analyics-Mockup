<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import dayjs from 'dayjs'

const props = defineProps<{
  from: string
  to: string
}>()

const emit = defineEmits<{
  'update:from': [val: string]
  'update:to': [val: string]
}>()

const fromDate = computed({
  get: () => props.from ? dayjs(props.from).toDate() : null,
  set: (val: Date | null) => {
    if (val) emit('update:from', dayjs(val).format('YYYY-MM-DD'))
  },
})

const toDate = computed({
  get: () => props.to ? dayjs(props.to).toDate() : null,
  set: (val: Date | null) => {
    if (val) emit('update:to', dayjs(val).format('YYYY-MM-DD'))
  },
})
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px;">
    <label style="font-size: 13px; color: #727272;">From</label>
    <VueDatePicker
      v-model="fromDate"
      :enable-time-picker="false"
      auto-apply
      :format="'MM/dd/yyyy'"
      input-class-name="date-input"
      style="width: 155px;"
    />
  </div>
  <div style="display: flex; align-items: center; gap: 8px;">
    <label style="font-size: 13px; color: #727272;">To</label>
    <VueDatePicker
      v-model="toDate"
      :enable-time-picker="false"
      auto-apply
      :format="'MM/dd/yyyy'"
      input-class-name="date-input"
      style="width: 155px;"
    />
  </div>
</template>
