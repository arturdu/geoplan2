<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'
import { orders, projects, users, weatherData } from '@/data/mock'
import type { WeatherData } from '@/types'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── PANEL 1 VARIANT: "Map-Focused Layout" ─────────────
// Focus: Fullscreen map with floating panels, minimal UI, maximum map visibility

// ── Compact Stats ──────────────────────────────────────
const liveStats = computed(() => {
  const activeTeams = users.filter(u => u.type === 'surveyor' && u.is_active && u.lon && u.lat).length
  const activeMissions = orders.filter(o => o.status === 'in_progress').length
  const completedToday = orders.filter(o => {
    if (o.status !== 'completed' || !o.execute_date) return false
    const today = new Date()
    const d = new Date(o.execute_date)
    return d.toDateString() === today.toDateString()
  }).length

  return { activeTeams, activeMissions, completedToday }
})

// ── Weather Data ───────────────────────────────────────
const weatherIconMap: Record<string, string> = {
  '01d': 'tabler-sun',
  '01n': 'tabler-moon',
  '02d': 'tabler-cloud-sun',
  '02n': 'tabler-cloud-moon',
  '03d': 'tabler-cloud',
  '03n': 'tabler-cloud',
  '04d': 'tabler-cloud-filled',
  '04n': 'tabler-cloud-filled',
  '09d': 'tabler-cloud-rain',
  '09n': 'tabler-cloud-rain',
  '10d': 'tabler-cloud-rain',
  '10n': 'tabler-cloud-rain',
  '13d': 'tabler-snowflake',
  '13n': 'tabler-snowflake',
  '50d': 'tabler-mist',
  '50n': 'tabler-mist',
}

const getWeatherIcon = (icon: string) => weatherIconMap[icon] || 'tabler-cloud'

const getWeatherColor = (icon: string): string => {
  if (icon.startsWith('01')) return 'warning'
  if (icon.startsWith('02') || icon.startsWith('03')) return 'info'
  if (icon.startsWith('09') || icon.startsWith('10')) return 'primary'
  if (icon.startsWith('13')) return 'secondary'
  return 'info'
}

// ── Map Setup ──────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const mapContainer = ref<HTMLElement | null>(null)
const mapLoaded = ref(false)
const mapLoadError = ref(false)

const activeProjectLocations = computed(() =>
  projects.filter(p => !p.closed && p.lat && p.lon),
)

const surveyorsWithLocation = computed(() =>
  users.filter(u => u.type === 'surveyor' && u.lon && u.lat),
)

function getProjectOrders(projectId: number) {
  return orders.filter(o => o.project_id === projectId)
}

function getProjectMarkerColor(projectId: number): string {
  const projectOrders = getProjectOrders(projectId)
  const project = projects.find(p => p.id === projectId)

  if (project?.deadline_active) {
    const hasOverdue = projectOrders.some(o => {
      if (o.status === 'pending' || o.status === 'in_progress') {
        const comp = new Date(o.completion_date)
        return comp < new Date()
      }
      return false
    })
    if (hasOverdue) return '#E53935'
  }

  const hasInProgress = projectOrders.some(o => o.status === 'in_progress')
  if (hasInProgress) return '#4CAF50'

  const hasPending = projectOrders.some(o => o.status === 'pending')
  if (hasPending) return '#FF9800'

  return '#9E9E9E'
}

let mapInstance: any = null
const projectMarkers: Map<number, any> = new Map()
const selectedProjectName = ref<string | null>(null)
let highlightedMarkerEl: HTMLElement | null = null

const mapStyle = computed(() =>
  vuetifyTheme.current.value.dark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12'
)

function flyToProject(weather: WeatherData) {
  const project = projects.find(p => p.name === weather.project_name)
  if (!project || !mapInstance) return

  selectedProjectName.value = weather.project_name

  if (highlightedMarkerEl) {
    highlightedMarkerEl.classList.remove('marker-highlighted')
    highlightedMarkerEl = null
  }

  mapInstance.flyTo({
    center: [project.lon, project.lat],
    zoom: 13,
    speed: 1.5,
  })

  const marker = projectMarkers.get(project.id)
  if (marker) {
    const el = marker.getElement()
    el.classList.add('marker-highlighted')
    highlightedMarkerEl = el
    marker.togglePopup()
  }
}

// ── UI State ───────────────────────────────────────────
const showWeatherPanel = ref(true)
const showStatsPanel = ref(true)
const showProjectList = ref(false)

const toggleProjectList = () => {
  showProjectList.value = !showProjectList.value
}

onMounted(async () => {
  if (!mapContainer.value) return

  try {
    const mapboxgl = await import('mapbox-gl')
    mapboxgl.default.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.default.Map({
      container: mapContainer.value,
      style: mapStyle.value,
      center: [20.0, 50.5],
      zoom: 7,
    })

    mapInstance = map

    map.on('load', () => {
      mapLoaded.value = true
    })

    map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.default.ScaleControl({ unit: 'metric' }), 'bottom-right')

    const addMarkers = () => {
      projectMarkers.forEach(marker => marker.remove())
      projectMarkers.clear()

      activeProjectLocations.value.forEach(project => {
        const projectOrders = getProjectOrders(project.id)
        const inProgress = projectOrders.filter(o => o.status === 'in_progress').length
        const pending = projectOrders.filter(o => o.status === 'pending').length
        const completed = projectOrders.filter(o => o.status === 'completed').length
        const color = getProjectMarkerColor(project.id)
        const isActive = color === '#4CAF50'

        const popup = new mapboxgl.default.Popup({ offset: 25, maxWidth: '280px' }).setHTML(
          `<div style="padding: 8px 4px;">
            <strong style="font-size: 15px;">${project.name}</strong>
            <br/>
            <span style="color: #666; font-size: 12px;">${project.info}</span>
            <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;"/>
            <div style="font-size: 13px; line-height: 1.8;">
              <span style="color: #4CAF50;">●</span> W toku: <b>${inProgress}</b><br/>
              <span style="color: #FF9800;">●</span> Oczekujące: <b>${pending}</b><br/>
              <span style="color: #9E9E9E;">●</span> Wykonane: <b>${completed}</b>
            </div>
          </div>`,
        )

        const el = document.createElement('div')
        el.className = 'project-marker-enhanced'
        el.style.cssText = `width: 22px; height: 22px; background: ${color}; border-radius: 50%; border: 4px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: pointer;`

        if (isActive) el.classList.add('marker-pulsing')

        const marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([project.lon, project.lat])
          .setPopup(popup)
          .addTo(map)

        projectMarkers.set(project.id, marker)
      })

      surveyorsWithLocation.value.forEach(surveyor => {
        const updatedAt = surveyor.location_updated_at
          ? new Date(surveyor.location_updated_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
          : 'brak danych'

        const popup = new mapboxgl.default.Popup({ offset: 20, maxWidth: '240px' }).setHTML(
          `<div style="padding: 8px 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 32px; height: 32px; background: #2196F3; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8c-3.3 0-6 2.7-6 6v3h12v-3c0-3.3-2.7-6-6-6z"/><path d="M12 17v4"/></svg>
              </div>
              <strong style="font-size: 14px;">${surveyor.full_name}</strong>
            </div>
            <div style="font-size: 12px; color: #666;">
              Ostatnia aktualizacja: <b>${updatedAt}</b>
            </div>
          </div>`,
        )

        const el = document.createElement('div')
        el.className = 'surveyor-marker-enhanced'
        el.style.cssText = 'width: 32px; height: 32px; background: #2196F3; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center;'
        el.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8c-3.3 0-6 2.7-6 6v3h12v-3c0-3.3-2.7-6-6-6z"/><path d="M12 17v4"/></svg>'

        new mapboxgl.default.Marker({ element: el })
          .setLngLat([surveyor.lon!, surveyor.lat!])
          .setPopup(popup)
          .addTo(map)
      })
    }

    addMarkers()

    watch(() => vuetifyTheme.current.value.dark, (isDark) => {
      if (map) {
        map.setStyle(isDark
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/streets-v12'
        )
        map.once('styledata', () => {
          addMarkers()
        })
      }
    })
  }
  catch {
    mapLoadError.value = true
  }
})
</script>

<template>
  <div class="map-focus-layout">
    <!-- Fullscreen Map Container -->
    <div
      v-if="!mapLoadError"
      ref="mapContainer"
      class="map-fullscreen"
    />

    <!-- Map Load Error -->
    <template v-else>
      <VAlert
        type="warning"
        variant="tonal"
        class="ma-4"
      >
        Nie udało się załadować mapy
      </VAlert>
    </template>

    <!-- Floating Top Bar - Live Stats -->
    <Transition name="slide-down">
      <div
        v-if="showStatsPanel"
        class="floating-panel floating-topbar"
      >
        <VCard class="glassmorphic">
          <VCardText class="pa-3">
            <div class="d-flex align-center justify-space-between gap-4">
              <div class="d-flex align-center gap-2">
                <VIcon
                  icon="tabler-map-2"
                  size="28"
                  color="primary"
                />
                <h6 class="text-h6 font-weight-bold">
                  Mapa Operacyjna
                </h6>
              </div>

              <div class="d-flex align-center gap-6">
                <div class="stat-compact">
                  <div class="d-flex align-center gap-2">
                    <VAvatar
                      color="success"
                      variant="flat"
                      size="32"
                    >
                      <VIcon
                        icon="tabler-users"
                        size="18"
                      />
                    </VAvatar>
                    <div>
                      <div class="text-h6 font-weight-bold">
                        {{ liveStats.activeTeams }}
                      </div>
                      <div class="text-caption">
                        Ekipy
                      </div>
                    </div>
                  </div>
                </div>

                <VDivider vertical />

                <div class="stat-compact">
                  <div class="d-flex align-center gap-2">
                    <VAvatar
                      color="info"
                      variant="flat"
                      size="32"
                    >
                      <VIcon
                        icon="tabler-target"
                        size="18"
                      />
                    </VAvatar>
                    <div>
                      <div class="text-h6 font-weight-bold">
                        {{ liveStats.activeMissions }}
                      </div>
                      <div class="text-caption">
                        W toku
                      </div>
                    </div>
                  </div>
                </div>

                <VDivider vertical />

                <div class="stat-compact">
                  <div class="d-flex align-center gap-2">
                    <VAvatar
                      color="warning"
                      variant="flat"
                      size="32"
                    >
                      <VIcon
                        icon="tabler-check"
                        size="18"
                      />
                    </VAvatar>
                    <div>
                      <div class="text-h6 font-weight-bold">
                        {{ liveStats.completedToday }}
                      </div>
                      <div class="text-caption">
                        Dzisiaj
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex align-center gap-2">
                <VChip
                  color="success"
                  size="small"
                  variant="flat"
                >
                  <div class="d-flex align-center gap-1">
                    <span class="live-dot" />
                    LIVE
                  </div>
                </VChip>
                <VBtn
                  icon="tabler-x"
                  size="small"
                  variant="text"
                  @click="showStatsPanel = false"
                />
              </div>
            </div>
          </VCardText>
        </VCard>
      </div>
    </Transition>

    <!-- Floating Weather Sidebar -->
    <Transition name="slide-left">
      <div
        v-if="showWeatherPanel"
        class="floating-panel floating-sidebar-right"
      >
        <VCard class="glassmorphic h-100 d-flex flex-column">
          <VCardItem class="pb-0">
            <template #prepend>
              <VIcon
                icon="tabler-cloud"
                size="24"
                color="info"
              />
            </template>
            <VCardTitle class="text-h6">
              Pogoda
            </VCardTitle>
            <template #append>
              <VBtn
                icon="tabler-x"
                size="x-small"
                variant="text"
                @click="showWeatherPanel = false"
              />
            </template>
          </VCardItem>
          <VCardText class="flex-grow-1 overflow-y-auto weather-compact-list">
            <div class="d-flex flex-column gap-2">
              <VCard
                v-for="weather in (weatherData as WeatherData[])"
                :key="weather.project_name"
                variant="tonal"
                :color="selectedProjectName === weather.project_name ? 'primary' : getWeatherColor(weather.current.icon)"
                class="weather-compact-card"
                :class="{ 'weather-compact-card--selected': selectedProjectName === weather.project_name }"
                @click="flyToProject(weather)"
              >
                <VCardText class="pa-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="flex-grow-1">
                      <h6 class="text-subtitle-2 font-weight-bold mb-0">
                        {{ weather.project_name }}
                      </h6>
                      <span class="text-caption text-capitalize">
                        {{ weather.current.description }}
                      </span>
                    </div>
                    <VIcon
                      :icon="getWeatherIcon(weather.current.icon)"
                      size="32"
                      :color="getWeatherColor(weather.current.icon)"
                    />
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-end gap-1">
                      <span class="text-h5 font-weight-bold line-height-1">
                        {{ weather.current.temp }}
                      </span>
                      <span class="text-body-2 pb-1">
                        °C
                      </span>
                    </div>
                    <div class="d-flex gap-2">
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-droplet"
                          size="12"
                        />
                        <span class="text-caption">{{ weather.current.humidity }}%</span>
                      </div>
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-wind"
                          size="12"
                        />
                        <span class="text-caption">{{ weather.current.wind }}</span>
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCardText>
        </VCard>
      </div>
    </Transition>

    <!-- Floating Action Buttons - Bottom Left -->
    <div class="floating-fab-group">
      <VTooltip location="right">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="tabler-chart-bar"
            color="primary"
            size="large"
            elevation="8"
            class="fab-button"
            @click="showStatsPanel = !showStatsPanel"
          />
        </template>
        <span>Pokaż/Ukryj Statystyki</span>
      </VTooltip>

      <VTooltip location="right">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="tabler-cloud"
            color="info"
            size="large"
            elevation="8"
            class="fab-button"
            @click="showWeatherPanel = !showWeatherPanel"
          />
        </template>
        <span>Pokaż/Ukryj Pogodę</span>
      </VTooltip>

      <VTooltip location="right">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="tabler-list"
            color="success"
            size="large"
            elevation="8"
            class="fab-button"
            @click="toggleProjectList"
          />
        </template>
        <span>Lista Projektów</span>
      </VTooltip>
    </div>

    <!-- Floating Project List (Optional) -->
    <Transition name="slide-right">
      <div
        v-if="showProjectList"
        class="floating-panel floating-sidebar-left"
      >
        <VCard class="glassmorphic h-100 d-flex flex-column">
          <VCardItem class="pb-0">
            <template #prepend>
              <VIcon
                icon="tabler-building"
                size="24"
                color="success"
              />
            </template>
            <VCardTitle class="text-h6">
              Projekty
            </VCardTitle>
            <template #append>
              <VBtn
                icon="tabler-x"
                size="x-small"
                variant="text"
                @click="showProjectList = false"
              />
            </template>
          </VCardItem>
          <VCardText class="flex-grow-1 overflow-y-auto">
            <VList>
              <VListItem
                v-for="project in activeProjectLocations"
                :key="project.id"
                density="compact"
              >
                <template #prepend>
                  <VAvatar
                    :color="getProjectMarkerColor(project.id) === '#4CAF50' ? 'success' : 'warning'"
                    size="36"
                    variant="tonal"
                  >
                    <VIcon
                      icon="tabler-map-pin"
                      size="18"
                    />
                  </VAvatar>
                </template>
                <VListItemTitle class="font-weight-medium">
                  {{ project.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-caption">
                  {{ getProjectOrders(project.id).length }} zleceń
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.map-focus-layout {
  position: relative;
  block-size: calc(100vh - 120px);
  inline-size: 100%;
  overflow: hidden;

  // Fullscreen map
  .map-fullscreen {
    position: absolute;
    inset: 0;
    block-size: 100%;
    inline-size: 100%;
  }

  // Floating panels
  .floating-panel {
    position: absolute;
    z-index: 10;
  }

  .floating-topbar {
    inset-block-start: 16px;
    inset-inline: 16px;
  }

  .floating-sidebar-right {
    inset-block-start: 90px;
    inset-block-end: 16px;
    inset-inline-end: 16px;
    inline-size: 340px;
  }

  .floating-sidebar-left {
    inset-block-start: 90px;
    inset-block-end: 16px;
    inset-inline-start: 16px;
    inline-size: 320px;
  }

  // Glassmorphic effect
  .glassmorphic {
    background: rgba(var(--v-theme-surface), 0.85) !important;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--v-border-color), 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  // Compact stats
  .stat-compact {
    .text-caption {
      font-size: 0.7rem;
      line-height: 1;
      opacity: 0.7;
    }
  }

  // Weather compact cards
  .weather-compact-list {
    max-block-size: calc(100vh - 240px);
  }

  .weather-compact-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &--selected {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 1px;
    }
  }

  // Floating action buttons
  .floating-fab-group {
    position: absolute;
    inset-block-end: 24px;
    inset-inline-start: 24px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .fab-button {
      backdrop-filter: blur(8px);
    }
  }

  // Live indicator
  .live-dot {
    display: inline-block;
    block-size: 8px;
    inline-size: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: live-pulse 2s ease-out infinite;
  }

  @keyframes live-pulse {
    0% {
      box-shadow: 0 0 0 0 currentColor;
    }
    70% {
      box-shadow: 0 0 0 8px transparent;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
    }
  }

  .line-height-1 {
    line-height: 1;
  }
}

// Transition animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>

<style lang="scss">
// Map marker enhancements
.project-marker-enhanced {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
}

.surveyor-marker-enhanced {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.15);
  }
}

.marker-pulsing {
  animation: pulse-ring-enhanced 2.5s ease-out infinite;
}

@keyframes pulse-ring-enhanced {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.marker-highlighted {
  animation: highlight-bounce 0.6s ease-out;
  outline: 4px solid #7367f0 !important;
  outline-offset: 3px;
  transform: scale(1.5);
  z-index: 100 !important;
}

@keyframes highlight-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.7);
  }
  100% {
    transform: scale(1.5);
  }
}
</style>
