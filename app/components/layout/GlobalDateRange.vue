<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import dayjs from 'dayjs'
import { useDashboardStore } from '~/stores/dashboard'

const store = useDashboardStore()

const fromDate = computed({
  get: () => store.dateFrom ? dayjs(store.dateFrom).toDate() : null,
  set: (val: Date | null) => {
    if (val) store.dateFrom = dayjs(val).format('YYYY-MM-DD')
  },
})

const toDate = computed({
  get: () => store.dateTo ? dayjs(store.dateTo).toDate() : null,
  set: (val: Date | null) => {
    if (val) store.dateTo = dayjs(val).format('YYYY-MM-DD')
  },
})
</script>

<template>
  <div class="global-date">
    <span class="global-date__label">Date Range</span>
    <div class="global-date__field">
      <label class="global-date__field-label">From</label>
      <VueDatePicker
        v-model="fromDate"
        :enable-time-picker="false"
        auto-apply
        :format="'MM/dd/yyyy'"
        input-class-name="date-input"
        style="width: 155px;"
      />
    </div>
    <div class="global-date__field">
      <label class="global-date__field-label">To</label>
      <VueDatePicker
        v-model="toDate"
        :enable-time-picker="false"
        auto-apply
        :format="'MM/dd/yyyy'"
        input-class-name="date-input"
        style="width: 155px;"
      />
    </div>
    <button class="global-date__reset" @click="store.resetDates()">Reset</button>
  </div>
</template>
