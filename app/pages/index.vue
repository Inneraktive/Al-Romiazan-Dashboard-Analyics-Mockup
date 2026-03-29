<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'

const store = useDashboardStore()
</script>

<template>
  <div style="max-width: 1200px; margin: 0 auto; padding: 0 32px;">
    <LayoutAppHeader />
    <LayoutTabNav />
    <LayoutGlobalDateRange />

    <div style="padding-top: 24px;">
      <TabsTabRevenue v-if="store.activeTab === 'revenue'" />
      <TabsTabBranches v-if="store.activeTab === 'branches'" />
      <TabsTabSalesperson v-if="store.activeTab === 'salespersons'" />
      <TabsTabProducts v-if="store.activeTab === 'products'" />
      <TabsTabCustomers v-if="store.activeTab === 'customers'" />
      <TabsTabOperations v-if="store.activeTab === 'operations'" />
      <TabsTabCampaigns v-if="store.activeTab === 'campaigns'" />
    </div>
  </div>
</template>
