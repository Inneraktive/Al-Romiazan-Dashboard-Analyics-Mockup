
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


export const LayoutAppHeader: typeof import("../app/components/layout/AppHeader.vue")['default']
export const LayoutGlobalDateRange: typeof import("../app/components/layout/GlobalDateRange.vue")['default']
export const LayoutTabNav: typeof import("../app/components/layout/TabNav.vue")['default']
export const TabsTabBranches: typeof import("../app/components/tabs/TabBranches.vue")['default']
export const TabsTabCampaigns: typeof import("../app/components/tabs/TabCampaigns.vue")['default']
export const TabsTabCustomers: typeof import("../app/components/tabs/TabCustomers.vue")['default']
export const TabsTabOperations: typeof import("../app/components/tabs/TabOperations.vue")['default']
export const TabsTabProducts: typeof import("../app/components/tabs/TabProducts.vue")['default']
export const TabsTabRevenue: typeof import("../app/components/tabs/TabRevenue.vue")['default']
export const TabsTabSalesperson: typeof import("../app/components/tabs/TabSalesperson.vue")['default']
export const UiAppDropdown: typeof import("../app/components/ui/AppDropdown.vue")['default']
export const UiAppMultiDropdown: typeof import("../app/components/ui/AppMultiDropdown.vue")['default']
export const UiCaretDownIcon: typeof import("../app/components/ui/CaretDownIcon.vue")['default']
export const UiChipsBar: typeof import("../app/components/ui/ChipsBar.vue")['default']
export const UiCtrlBar: typeof import("../app/components/ui/CtrlBar.vue")['default']
export const UiDateRangeInput: typeof import("../app/components/ui/DateRangeInput.vue")['default']
export const UiHeatmapCell: typeof import("../app/components/ui/HeatmapCell.vue")['default']
export const UiKpiCard: typeof import("../app/components/ui/KpiCard.vue")['default']
export const UiProgressRow: typeof import("../app/components/ui/ProgressRow.vue")['default']
export const UiSectionCard: typeof import("../app/components/ui/SectionCard.vue")['default']
export const UiTrendUpIcon: typeof import("../app/components/ui/TrendUpIcon.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyLayoutAppHeader: LazyComponent<typeof import("../app/components/layout/AppHeader.vue")['default']>
export const LazyLayoutGlobalDateRange: LazyComponent<typeof import("../app/components/layout/GlobalDateRange.vue")['default']>
export const LazyLayoutTabNav: LazyComponent<typeof import("../app/components/layout/TabNav.vue")['default']>
export const LazyTabsTabBranches: LazyComponent<typeof import("../app/components/tabs/TabBranches.vue")['default']>
export const LazyTabsTabCampaigns: LazyComponent<typeof import("../app/components/tabs/TabCampaigns.vue")['default']>
export const LazyTabsTabCustomers: LazyComponent<typeof import("../app/components/tabs/TabCustomers.vue")['default']>
export const LazyTabsTabOperations: LazyComponent<typeof import("../app/components/tabs/TabOperations.vue")['default']>
export const LazyTabsTabProducts: LazyComponent<typeof import("../app/components/tabs/TabProducts.vue")['default']>
export const LazyTabsTabRevenue: LazyComponent<typeof import("../app/components/tabs/TabRevenue.vue")['default']>
export const LazyTabsTabSalesperson: LazyComponent<typeof import("../app/components/tabs/TabSalesperson.vue")['default']>
export const LazyUiAppDropdown: LazyComponent<typeof import("../app/components/ui/AppDropdown.vue")['default']>
export const LazyUiAppMultiDropdown: LazyComponent<typeof import("../app/components/ui/AppMultiDropdown.vue")['default']>
export const LazyUiCaretDownIcon: LazyComponent<typeof import("../app/components/ui/CaretDownIcon.vue")['default']>
export const LazyUiChipsBar: LazyComponent<typeof import("../app/components/ui/ChipsBar.vue")['default']>
export const LazyUiCtrlBar: LazyComponent<typeof import("../app/components/ui/CtrlBar.vue")['default']>
export const LazyUiDateRangeInput: LazyComponent<typeof import("../app/components/ui/DateRangeInput.vue")['default']>
export const LazyUiHeatmapCell: LazyComponent<typeof import("../app/components/ui/HeatmapCell.vue")['default']>
export const LazyUiKpiCard: LazyComponent<typeof import("../app/components/ui/KpiCard.vue")['default']>
export const LazyUiProgressRow: LazyComponent<typeof import("../app/components/ui/ProgressRow.vue")['default']>
export const LazyUiSectionCard: LazyComponent<typeof import("../app/components/ui/SectionCard.vue")['default']>
export const LazyUiTrendUpIcon: LazyComponent<typeof import("../app/components/ui/TrendUpIcon.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
