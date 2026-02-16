<script setup lang="tsx">
import { useStorage } from '@vueuse/core'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useTheme } from 'vuetify'
import { staticPrimaryColor, staticPrimaryDarkenColor } from '@/plugins/vuetify/theme'
import { Skins, Theme } from '@core/enums'
import { useConfigStore } from '@core/stores/config'
import { ContentWidth, NavbarType } from '@layouts/enums'
import { cookieRef, namespaceConfig } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'

const isNavDrawerOpen = ref(false)

const configStore = useConfigStore()

// Primary Color
const vuetifyTheme = useTheme()

const colors: { main: string; darken: string; label: string }[] = [
  { main: staticPrimaryColor, darken: staticPrimaryDarkenColor, label: 'Indygo' },
  { main: '#28C76F', darken: '#24B364', label: 'Zielony' },
  { main: '#FF9F43', darken: '#E68F3C', label: 'Bursztynowy' },
  { main: '#FF4C51', darken: '#E64449', label: 'Czerwony' },
  { main: '#00BAD1', darken: '#00A7BC', label: 'Cyjan' },
]

const customPrimaryColor = ref('#663131')

watch(
  () => configStore.theme,
  () => {
    const cookiePrimaryColor = cookieRef(`${vuetifyTheme.name.value}ThemePrimaryColor`, null).value

    if (cookiePrimaryColor && !colors.some(color => color.main === cookiePrimaryColor))
      customPrimaryColor.value = cookiePrimaryColor
  },
  { immediate: true },
)

const setPrimaryColor = useDebounceFn((color: { main: string; darken: string }) => {
  vuetifyTheme.themes.value[vuetifyTheme.name.value].colors.primary = color.main
  vuetifyTheme.themes.value[vuetifyTheme.name.value].colors['primary-darken-1'] = color.darken

  cookieRef<string | null>(`${vuetifyTheme.name.value}ThemePrimaryColor`, null).value = color.main
  cookieRef<string | null>(`${vuetifyTheme.name.value}ThemePrimaryDarkenColor`, null).value = color.darken

  useStorage<string | null>(namespaceConfig('initial-loader-color'), null).value = color.main
}, 100)

// Theme mode
const themeMode = computed(() => {
  return [
    {
      bgImage: 'tabler-sun',
      value: Theme.Light,
      label: 'Jasny',
    },
    {
      bgImage: 'tabler-moon-stars',
      value: Theme.Dark,
      label: 'Ciemny',
    },
    {
      bgImage: 'tabler-device-desktop-analytics',
      value: Theme.System,
      label: 'System',
    },
  ]
})

// Skin
const themeSkin = computed(() => {
  return [
    {
      value: Skins.Default,
      label: 'Domyślny',
      icon: 'tabler-layout',
    },
    {
      value: Skins.Bordered,
      label: 'Obramowany',
      icon: 'tabler-border-outer',
    },
  ]
})

// Content Width
const contentWidthOptions = computed(() => {
  return [
    {
      value: ContentWidth.Fluid,
      label: 'Pełny',
      icon: 'tabler-arrows-horizontal',
    },
    {
      value: ContentWidth.Boxed,
      label: 'Kompaktowy',
      icon: 'tabler-box-align-top',
    },
  ]
})

// Navbar Type
const navbarTypeOptions = computed(() => {
  return [
    {
      value: NavbarType.Sticky,
      label: 'Przyklejony',
      icon: 'tabler-pinned',
    },
    {
      value: NavbarType.Static,
      label: 'Statyczny',
      icon: 'tabler-layout-navbar',
    },
    {
      value: NavbarType.Hidden,
      label: 'Ukryty',
      icon: 'tabler-layout-navbar-collapse',
    },
  ]
})

// check if any value set in cookie
const isCookieHasAnyValue = ref(false)

watch([
  () => vuetifyTheme.current.value.colors.primary,
  configStore.$state,
], () => {
  const initialConfigValue = [
    staticPrimaryColor,
    staticPrimaryColor,
    themeConfig.app.theme,
    themeConfig.app.skin,
    themeConfig.app.animationLevel,
    themeConfig.verticalNav.isVerticalNavCollapsed,
    themeConfig.app.contentWidth,
    themeConfig.app.contentLayoutNav,
  ]

  const themeConfigValue = [
    vuetifyTheme.themes.value.light.colors.primary,
    vuetifyTheme.themes.value.dark.colors.primary,
    configStore.theme,
    configStore.skin,
    configStore.animationLevel,
    configStore.isVerticalNavCollapsed,
    configStore.appContentWidth,
    configStore.appContentLayoutNav,
  ]

  isCookieHasAnyValue.value = JSON.stringify(themeConfigValue) !== JSON.stringify(initialConfigValue)
}, { deep: true, immediate: true })

// reset customizer
const resetCustomizer = async () => {
  if (isCookieHasAnyValue.value) {
    vuetifyTheme.themes.value.light.colors.primary = staticPrimaryColor
    vuetifyTheme.themes.value.dark.colors.primary = staticPrimaryColor
    vuetifyTheme.themes.value.light.colors['primary-darken-1'] = staticPrimaryDarkenColor
    vuetifyTheme.themes.value.dark.colors['primary-darken-1'] = staticPrimaryDarkenColor

    configStore.theme = themeConfig.app.theme
    configStore.skin = themeConfig.app.skin
    configStore.animationLevel = themeConfig.app.animationLevel
    configStore.appContentWidth = themeConfig.app.contentWidth
    configStore.appContentLayoutNav = themeConfig.app.contentLayoutNav
    configStore.isVerticalNavCollapsed = themeConfig.verticalNav.isVerticalNavCollapsed
    useStorage<string | null>(namespaceConfig('initial-loader-color'), null).value = staticPrimaryColor

    cookieRef('lightThemePrimaryColor', null).value = null
    cookieRef('darkThemePrimaryColor', null).value = null
    cookieRef('lightThemePrimaryDarkenColor', null).value = null
    cookieRef('darkThemePrimaryDarkenColor', null).value = null

    await nextTick()

    isCookieHasAnyValue.value = false
    customPrimaryColor.value = '#ffffff'
  }
}
</script>

<template>
  <div class="d-lg-block d-none">
    <VBtn
      icon
      class="app-customizer-toggler rounded-s-lg rounded-0"
      style="z-index: 1001;"
      @click="isNavDrawerOpen = true"
    >
      <VIcon
        size="22"
        icon="tabler-settings"
      />
    </VBtn>

    <VNavigationDrawer
      v-model="isNavDrawerOpen"
      data-allow-mismatch
      temporary
      touchless
      border="none"
      location="end"
      width="380"
      elevation="10"
      :scrim="false"
      class="app-customizer"
    >
      <!-- Header -->
      <div class="customizer-heading d-flex align-center justify-space-between">
        <div>
          <h6 class="text-h6">
            <VIcon
              icon="tabler-palette"
              size="20"
              class="me-1"
            />
            Ustawienia motywu
          </h6>
          <p class="text-body-2 mb-0 text-medium-emphasis">
            Dostosuj wygląd aplikacji
          </p>
        </div>

        <div class="d-flex align-center gap-1">
          <VBtn
            icon
            variant="text"
            size="small"
            color="medium-emphasis"
            @click="resetCustomizer"
          >
            <VBadge
              v-show="isCookieHasAnyValue"
              dot
              color="error"
              offset-x="-29"
              offset-y="-14"
            />

            <VIcon
              size="24"
              color="high-emphasis"
              icon="tabler-refresh"
            />
          </VBtn>

          <VBtn
            icon
            variant="text"
            color="medium-emphasis"
            size="small"
            @click="isNavDrawerOpen = false"
          >
            <VIcon
              icon="tabler-x"
              color="high-emphasis"
              size="24"
            />
          </VBtn>
        </div>
      </div>

      <VDivider />

      <PerfectScrollbar
        tag="ul"
        :options="{ wheelPropagation: false }"
      >
        <!-- SECTION: Kolor główny -->
        <CustomizerSection
          title="Kolor główny"
          :divider="false"
        >
          <div class="d-flex flex-column gap-2">
            <div
              class="d-flex app-customizer-primary-colors"
              style="column-gap: 0.75rem; margin-block-start: 2px;"
            >
              <VTooltip
                v-for="color in colors"
                :key="color.main"
                location="top"
              >
                <template #activator="{ props: tooltipProps }">
                  <div
                    v-bind="tooltipProps"
                    style="
                  border-radius: 0.375rem;
                  outline: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
                  padding-block: 0.5rem;
                  padding-inline: 0.625rem;"
                    class="primary-color-wrapper cursor-pointer"
                    :class="vuetifyTheme.current.value.colors.primary === color.main ? 'active' : ''"
                    :style="vuetifyTheme.current.value.colors.primary === color.main ? `outline-color: ${color.main}; outline-width:2px;` : `--v-color:${color.main}`"
                    @click="setPrimaryColor(color)"
                  >
                    <div
                      style="border-radius: 0.375rem;block-size: 2.125rem; inline-size: 1.8938rem;"
                      :style="{ backgroundColor: color.main }"
                    />
                  </div>
                </template>
                {{ color.label }}
              </VTooltip>

              <div
                class="primary-color-wrapper cursor-pointer d-flex align-center"
                style="
              border-radius: 0.375rem;
              outline: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
              padding-block: 0.5rem;
              padding-inline: 0.625rem;"
                :class="vuetifyTheme.current.value.colors.primary === customPrimaryColor ? 'active' : ''"
                :style="vuetifyTheme.current.value.colors.primary === customPrimaryColor ? `outline-color: ${customPrimaryColor}; outline-width:2px;` : ''"
              >
                <VBtn
                  icon
                  size="30"
                  :color="vuetifyTheme.current.value.colors.primary === customPrimaryColor ? customPrimaryColor : $vuetify.theme.current.dark ? '#8692d029' : '#4b465c29'"
                  variant="flat"
                  style="border-radius: 0.375rem;"
                >
                  <VIcon
                    size="20"
                    icon="tabler-color-picker"
                    :color="vuetifyTheme.current.value.colors.primary === customPrimaryColor ? 'rgb(var(--v-theme-on-primary))' : ''"
                  />
                </VBtn>

                <VMenu
                  activator="parent"
                  :close-on-content-click="false"
                >
                  <VList>
                    <VListItem>
                      <VColorPicker
                        v-model="customPrimaryColor"
                        mode="hex"
                        :modes="['hex']"
                        @update:model-value="setPrimaryColor({ main: customPrimaryColor, darken: customPrimaryColor })"
                      />
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
            </div>
          </div>
        </CustomizerSection>

        <!-- SECTION: Motyw -->
        <CustomizerSection title="Motyw">
          <div class="d-flex flex-column gap-2">
            <CustomRadiosWithImage
              :key="configStore.theme"
              v-model:selected-radio="configStore.theme"
              :radio-content="themeMode"
              :grid-column="{ cols: '4' }"
              class="customizer-skins"
            >
              <template #label="item">
                <span class="text-sm text-medium-emphasis mt-1">{{ item?.label }}</span>
              </template>

              <template #content="{ item }">
                <div
                  class="customizer-skins-icon-wrapper d-flex align-center justify-center py-3 w-100"
                  style="min-inline-size: 100%;"
                >
                  <VIcon
                    size="30"
                    :icon="item.bgImage"
                    color="high-emphasis"
                  />
                </div>
              </template>
            </CustomRadiosWithImage>
          </div>
        </CustomizerSection>

        <!-- SECTION: Skóra -->
        <CustomizerSection title="Skóra">
          <div class="d-flex gap-4">
            <VBtn
              v-for="skin in themeSkin"
              :key="skin.value"
              :color="configStore.skin === skin.value ? 'primary' : 'secondary'"
              :variant="configStore.skin === skin.value ? 'elevated' : 'tonal'"
              class="flex-grow-1"
              @click="configStore.skin = skin.value"
            >
              <VIcon
                :icon="skin.icon"
                size="20"
                class="me-1"
              />
              {{ skin.label }}
            </VBtn>
          </div>
        </CustomizerSection>

        <!-- SECTION: Szerokość treści -->
        <CustomizerSection title="Szerokość treści">
          <div class="d-flex gap-4">
            <VBtn
              v-for="cw in contentWidthOptions"
              :key="cw.value"
              :color="configStore.appContentWidth === cw.value ? 'primary' : 'secondary'"
              :variant="configStore.appContentWidth === cw.value ? 'elevated' : 'tonal'"
              class="flex-grow-1"
              @click="configStore.appContentWidth = cw.value"
            >
              <VIcon
                :icon="cw.icon"
                size="20"
                class="me-1"
              />
              {{ cw.label }}
            </VBtn>
          </div>
        </CustomizerSection>

        <!-- SECTION: Pasek nawigacji -->
        <CustomizerSection title="Pasek nawigacji">
          <div class="d-flex gap-3 flex-wrap">
            <VBtn
              v-for="nt in navbarTypeOptions"
              :key="nt.value"
              :color="configStore.navbarType === nt.value ? 'primary' : 'secondary'"
              :variant="configStore.navbarType === nt.value ? 'elevated' : 'tonal'"
              size="small"
              class="flex-grow-1"
              @click="configStore.navbarType = nt.value"
            >
              <VIcon
                :icon="nt.icon"
                size="18"
                class="me-1"
              />
              {{ nt.label }}
            </VBtn>
          </div>
        </CustomizerSection>

        <!-- SECTION: Typ nawigacji -->
        <CustomizerSection title="Typ nawigacji">
          <div class="d-flex gap-4">
            <VBtn
              :color="configStore.appContentLayoutNav === 'vertical' ? 'primary' : 'secondary'"
              :variant="configStore.appContentLayoutNav === 'vertical' ? 'elevated' : 'tonal'"
              class="flex-grow-1"
              @click="configStore.appContentLayoutNav = 'vertical'"
            >
              <VIcon
                icon="tabler-layout-sidebar"
                size="20"
                class="me-1"
              />
              Boczny
            </VBtn>
            <VBtn
              :color="configStore.appContentLayoutNav === 'horizontal' ? 'primary' : 'secondary'"
              :variant="configStore.appContentLayoutNav === 'horizontal' ? 'elevated' : 'tonal'"
              class="flex-grow-1"
              @click="configStore.appContentLayoutNav = 'horizontal'"
            >
              <VIcon
                icon="tabler-layout-navbar"
                size="20"
                class="me-1"
              />
              Górny
            </VBtn>
          </div>
        </CustomizerSection>

        <!-- SECTION: Animacje -->
        <CustomizerSection title="Animacje">
          <div class="d-flex gap-3 flex-wrap">
            <VBtn
              :color="configStore.animationLevel === 'none' ? 'primary' : 'secondary'"
              :variant="configStore.animationLevel === 'none' ? 'elevated' : 'tonal'"
              size="small"
              class="flex-grow-1"
              @click="configStore.animationLevel = 'none'"
            >
              <VIcon
                icon="tabler-video-off"
                size="18"
                class="me-1"
              />
              Brak
            </VBtn>
            <VBtn
              :color="configStore.animationLevel === 'minimal' ? 'primary' : 'secondary'"
              :variant="configStore.animationLevel === 'minimal' ? 'elevated' : 'tonal'"
              size="small"
              class="flex-grow-1"
              @click="configStore.animationLevel = 'minimal'"
            >
              <VIcon
                icon="tabler-player-play"
                size="18"
                class="me-1"
              />
              Minimalne
            </VBtn>
            <VBtn
              :color="configStore.animationLevel === 'full' ? 'primary' : 'secondary'"
              :variant="configStore.animationLevel === 'full' ? 'elevated' : 'tonal'"
              size="small"
              class="flex-grow-1"
              @click="configStore.animationLevel = 'full'"
            >
              <VIcon
                icon="tabler-video"
                size="18"
                class="me-1"
              />
              Pełne
            </VBtn>
          </div>
        </CustomizerSection>

        <!-- SECTION: Menu boczne -->
        <CustomizerSection
          v-if="configStore.appContentLayoutNav === 'vertical'"
          title="Menu boczne"
        >
          <div class="d-flex align-center justify-space-between">
            <VLabel
              for="customizer-collapsed-nav"
              class="text-body-1 text-high-emphasis"
            >
              <VIcon
                icon="tabler-layout-sidebar-left-collapse"
                size="20"
                class="me-1"
              />
              Zwinięte menu
            </VLabel>
            <VSwitch
              id="customizer-collapsed-nav"
              v-model="configStore.isVerticalNavCollapsed"
              class="ms-2"
            />
          </div>
        </CustomizerSection>
      </PerfectScrollbar>
    </VNavigationDrawer>
  </div>
</template>

<style lang="scss">
@use "@layouts/styles/mixins" as layoutMixins;

.app-customizer {
  &.v-navigation-drawer--temporary:not(.v-navigation-drawer--active) {
    transform: translateX(110%) !important;

    @include layoutMixins.rtl {
      transform: translateX(-110%) !important;
    }
  }

  .customizer-section {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .customizer-heading {
    padding-block: 1rem;
    padding-inline: 1.5rem;
  }

  .custom-input-wrapper {
    .v-col {
      padding-inline: 10px;
    }

    .v-label.custom-input {
      border: none;
      color: rgb(var(--v-theme-on-surface));
      outline: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }

  .v-navigation-drawer__content {
    display: flex;
    flex-direction: column;
  }

  .v-label.custom-input.active {
    border-color: transparent;
    outline: 2px solid rgb(var(--v-theme-primary));
  }

  .v-label.custom-input:not(.active):hover {
    border-color: rgba(var(--v-border-color), 0.22);
  }

  .customizer-skins {
    .custom-input.active {
      .customizer-skins-icon-wrapper {
        background-color: rgba(var(--v-global-theme-primary), var(--v-selected-opacity));
      }
    }
  }

  .app-customizer-primary-colors {
    .primary-color-wrapper:not(.active) {
      &:hover {
        outline-color: rgba(var(--v-border-color), 0.22) !important;
      }
    }
  }
}

.app-customizer-toggler {
  position: fixed !important;
  inset-block-start: 20%;
  inset-inline-end: 0;
}
</style>
