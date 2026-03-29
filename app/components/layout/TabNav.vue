<script setup lang="ts">
import { tabs } from '~/utils/constants'
import { useDashboardStore } from '~/stores/dashboard'

const store = useDashboardStore()
</script>

<template>
  <div class="tab-nav">
    <button
      v-for="t in tabs"
      :key="t.key"
      :class="['tab-nav__btn', store.activeTab === t.key ? 'tab-nav__btn--active' : 'tab-nav__btn--inactive']"
      @click="store.setTab(t.key)"
    >
      {{ t.label }}
    </button>
  </div>
</template>
