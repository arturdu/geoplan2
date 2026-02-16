<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`"
      :class="`animation-level-${configStore.animationLevel}`"
    >
      <RouterView />

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>

<style>
/* Animation control classes */
.animation-level-none *,
.animation-level-none *::before,
.animation-level-none *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}

.animation-level-minimal * {
  animation-duration: 0.15s !important;
  transition-duration: 0.15s !important;
}

.animation-level-minimal *::before,
.animation-level-minimal *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
}

/* Full animations use default values - no override needed */
</style>
