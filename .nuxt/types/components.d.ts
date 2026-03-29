
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  LayoutAppHeader: typeof import("../../app/components/layout/AppHeader.vue")['default']
  LayoutGlobalDateRange: typeof import("../../app/components/layout/GlobalDateRange.vue")['default']
  LayoutTabNav: typeof import("../../app/components/layout/TabNav.vue")['default']
  TabsTabBranches: typeof import("../../app/components/tabs/TabBranches.vue")['default']
  TabsTabCampaigns: typeof import("../../app/components/tabs/TabCampaigns.vue")['default']
  TabsTabCustomers: typeof import("../../app/components/tabs/TabCustomers.vue")['default']
  TabsTabOperations: typeof import("../../app/components/tabs/TabOperations.vue")['default']
  TabsTabProducts: typeof import("../../app/components/tabs/TabProducts.vue")['default']
  TabsTabRevenue: typeof import("../../app/components/tabs/TabRevenue.vue")['default']
  TabsTabSalesperson: typeof import("../../app/components/tabs/TabSalesperson.vue")['default']
  UiAppDropdown: typeof import("../../app/components/ui/AppDropdown.vue")['default']
  UiAppMultiDropdown: typeof import("../../app/components/ui/AppMultiDropdown.vue")['default']
  UiCaretDownIcon: typeof import("../../app/components/ui/CaretDownIcon.vue")['default']
  UiChipsBar: typeof import("../../app/components/ui/ChipsBar.vue")['default']
  UiCtrlBar: typeof import("../../app/components/ui/CtrlBar.vue")['default']
  UiDateRangeInput: typeof import("../../app/components/ui/DateRangeInput.vue")['default']
  UiHeatmapCell: typeof import("../../app/components/ui/HeatmapCell.vue")['default']
  UiKpiCard: typeof import("../../app/components/ui/KpiCard.vue")['default']
  UiProgressRow: typeof import("../../app/components/ui/ProgressRow.vue")['default']
  UiSectionCard: typeof import("../../app/components/ui/SectionCard.vue")['default']
  UiTrendUpIcon: typeof import("../../app/components/ui/TrendUpIcon.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyLayoutAppHeader: LazyComponent<typeof import("../../app/components/layout/AppHeader.vue")['default']>
  LazyLayoutGlobalDateRange: LazyComponent<typeof import("../../app/components/layout/GlobalDateRange.vue")['default']>
  LazyLayoutTabNav: LazyComponent<typeof import("../../app/components/layout/TabNav.vue")['default']>
  LazyTabsTabBranches: LazyComponent<typeof import("../../app/components/tabs/TabBranches.vue")['default']>
  LazyTabsTabCampaigns: LazyComponent<typeof import("../../app/components/tabs/TabCampaigns.vue")['default']>
  LazyTabsTabCustomers: LazyComponent<typeof import("../../app/components/tabs/TabCustomers.vue")['default']>
  LazyTabsTabOperations: LazyComponent<typeof import("../../app/components/tabs/TabOperations.vue")['default']>
  LazyTabsTabProducts: LazyComponent<typeof import("../../app/components/tabs/TabProducts.vue")['default']>
  LazyTabsTabRevenue: LazyComponent<typeof import("../../app/components/tabs/TabRevenue.vue")['default']>
  LazyTabsTabSalesperson: LazyComponent<typeof import("../../app/components/tabs/TabSalesperson.vue")['default']>
  LazyUiAppDropdown: LazyComponent<typeof import("../../app/components/ui/AppDropdown.vue")['default']>
  LazyUiAppMultiDropdown: LazyComponent<typeof import("../../app/components/ui/AppMultiDropdown.vue")['default']>
  LazyUiCaretDownIcon: LazyComponent<typeof import("../../app/components/ui/CaretDownIcon.vue")['default']>
  LazyUiChipsBar: LazyComponent<typeof import("../../app/components/ui/ChipsBar.vue")['default']>
  LazyUiCtrlBar: LazyComponent<typeof import("../../app/components/ui/CtrlBar.vue")['default']>
  LazyUiDateRangeInput: LazyComponent<typeof import("../../app/components/ui/DateRangeInput.vue")['default']>
  LazyUiHeatmapCell: LazyComponent<typeof import("../../app/components/ui/HeatmapCell.vue")['default']>
  LazyUiKpiCard: LazyComponent<typeof import("../../app/components/ui/KpiCard.vue")['default']>
  LazyUiProgressRow: LazyComponent<typeof import("../../app/components/ui/ProgressRow.vue")['default']>
  LazyUiSectionCard: LazyComponent<typeof import("../../app/components/ui/SectionCard.vue")['default']>
  LazyUiTrendUpIcon: LazyComponent<typeof import("../../app/components/ui/TrendUpIcon.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
