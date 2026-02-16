<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'
import { orders, projects, users, weatherData } from '@/data/mock'
import type { WeatherData } from '@/types'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── Panel 1: Map-Centric Real-Time View ───────────────

// Row 1: 3 Key Metrics
const activeOrdersToday = computed(() => {
  const today = new Date()
  return orders.filter(o => {
    if (o.status === 'completed' || o.status === 'canceled') return false
    const completionDate = new Date(o.completion_date)
    return completionDate.toDateString() === today.toDateString()
  }).length
})

const surveyorsInField = computed(() =>
  users.filter(u => u.type === 'surveyor' && u.is_active && u.lon && u.lat).length
)

const weatherAlerts = computed(() => {
  let alerts = 0
  weatherData.forEach(w => {
    // Alert if temp < 0 or wind > 30
    if (w.current.temp < 0 || w.current.wind > 30) alerts++
    // Alert if rain or snow in icon
    if (w.current.icon.startsWith('09') || w.current.icon.startsWith('10') || w.current.icon.startsWith('13')) alerts++
  })
  return alerts
})

const keyMetrics = computed(() => [
  {
    title: 'Zlecenia dzisiaj',
    stats: String(activeOrdersToday.value),
    icon: 'tabler-calendar-check',
    color: 'primary',
    subtitle: 'do wykonania',
  },
  {
    title: 'Geodeci w terenie',
    stats: String(surveyorsInField.value),
    icon: 'tabler-users',
    color: 'success',
    subtitle: 'aktywnych zespolow',
  },
  {
    title: 'Alerty pogodowe',
    stats: String(weatherAlerts.value),
    icon: 'tabler-alert-triangle',
    color: weatherAlerts.value > 0 ? 'warning' : 'info',
    subtitle: 'wymaga uwagi',
  },
])

// ── Weather icon mapping ───────────────────────────────
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

// ── Map ────────────────────────────────────────────────
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

// Computed map style based on theme
const mapStyle = computed(() =>
  vuetifyTheme.current.value.dark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11'
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
    zoom: 12,
    speed: 1.2,
  })

  const marker = projectMarkers.get(project.id)
  if (marker) {
    const el = marker.getElement()
    el.classList.add('marker-highlighted')
    highlightedMarkerEl = el
    marker.togglePopup()
  }
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

    // Function to add all markers
    const addMarkers = () => {
      // Clear existing markers
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
        `<div style="padding: 6px 2px;">
          <strong style="font-size: 14px;">${project.name}</strong>
          <br/>
          <span style="color: #666; font-size: 12px;">${project.info}</span>
          <hr style="margin: 6px 0; border: none; border-top: 1px solid #eee;"/>
          <div style="font-size: 12px; line-height: 1.6;">
            <span style="color: #4CAF50;">&#9679;</span> W toku: <b>${inProgress}</b><br/>
            <span style="color: #FF9800;">&#9679;</span> Oczekujace: <b>${pending}</b><br/>
            <span style="color: #9E9E9E;">&#9679;</span> Wykonane: <b>${completed}</b><br/>
            <span style="color: #999; font-size: 11px;">Suma zlecen: ${project.orders_count}</span>
          </div>
        </div>`,
      )

      const el = document.createElement('div')
      el.className = 'project-marker'
      el.style.cssText = `width: 18px; height: 18px; background: ${color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;`

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

      const popup = new mapboxgl.default.Popup({ offset: 20, maxWidth: '220px' }).setHTML(
        `<div style="padding: 4px 2px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 28px; height: 28px; background: #2196F3; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
            </div>
            <strong style="font-size: 13px;">${surveyor.full_name}</strong>
          </div>
          <div style="font-size: 11px; color: #666;">
            Ostatnia aktualizacja: <b>${updatedAt}</b>
          </div>
        </div>`,
      )

      const el = document.createElement('div')
      el.className = 'surveyor-marker'
      el.style.cssText = 'width: 28px; height: 28px; background: #2196F3; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center;'
      el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8c-3.3 0-6 2.7-6 6v3h12v-3c0-3.3-2.7-6-6-6z"/><path d="M12 17v4"/></svg>'

        new mapboxgl.default.Marker({ element: el })
          .setLngLat([surveyor.lon!, surveyor.lat!])
          .setPopup(popup)
          .addTo(map)
      })
    }

    // Add markers initially
    addMarkers()

    // Watch for theme changes and update map style
    watch(() => vuetifyTheme.current.value.dark, (isDark) => {
      if (map) {
        map.setStyle(isDark
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11'
        )
        // Re-add markers after style change
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

// ── Active orders today ────────────────────────────────
const todaysOrders = computed(() => {
  const today = new Date()
  return orders.filter(o => {
    if (o.status === 'completed' || o.status === 'canceled') return false
    const completionDate = new Date(o.completion_date)
    return completionDate.toDateString() === today.toDateString()
  }).sort((a, b) => {
    const statusOrder = { in_progress: 0, pending: 1, continuous: 2, postponed: 3 }
    return statusOrder[a.status] - statusOrder[b.status]
  })
})

const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completed: 'success',
    in_progress: 'info',
    pending: 'warning',
    continuous: 'secondary',
    postponed: 'error',
    canceled: 'default',
  }
  return colors[status] || 'default'
}

const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    completed: 'Wykonane',
    in_progress: 'W toku',
    pending: 'Oczekujace',
    continuous: 'Ciagle',
    postponed: 'Odlozone',
    canceled: 'Anulowane',
  }
  return labels[status] || status
}
</script>

<template>
  <div>
    <!-- Row 1: 3 Key Metrics -->
    <VRow class="mb-6">
      <VCol
        v-for="card in keyMetrics"
        :key="card.title"
        cols="12"
        md="4"
      >
        <VCard>
          <VCardText class="pa-4 d-flex flex-column gap-2">
            <div class="d-flex align-center justify-space-between">
              <VAvatar
                :color="card.color"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  :icon="card.icon"
                  size="28"
                />
              </VAvatar>
              <div class="text-end">
                <h3 class="text-h3 font-weight-bold">
                  {{ card.stats }}
                </h3>
              </div>
            </div>
            <div>
              <div class="text-body-1 font-weight-medium">
                {{ card.title }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ card.subtitle }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 2: Large Map -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-map-2"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Mapa - lokalizacje w czasie rzeczywistym</VCardTitle>
            <VCardSubtitle>{{ activeProjectLocations.length }} projektow &bull; {{ surveyorsWithLocation.length }} geodetow w terenie &bull; Aktualizacja na zywo</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <!-- Legend -->
            <div class="d-flex flex-wrap gap-4 mb-3">
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--green" />
                <span class="text-caption">Aktywne (w toku)</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--orange" />
                <span class="text-caption">Oczekujace</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--grey" />
                <span class="text-caption">Wykonane</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--red" />
                <span class="text-caption">Problem z terminem</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--blue" />
                <span class="text-caption">Geodeta</span>
              </div>
            </div>

            <template v-if="mapLoadError">
              <VAlert
                type="warning"
                variant="tonal"
                class="mb-4"
              >
                Nie udalo sie zaladowac mapy. Lista projektow ponizej:
              </VAlert>
              <VList>
                <VListItem
                  v-for="project in activeProjectLocations"
                  :key="project.id"
                >
                  <template #prepend>
                    <VAvatar
                      color="primary"
                      variant="tonal"
                      rounded
                      size="36"
                    >
                      <VIcon
                        icon="tabler-map-pin"
                        size="20"
                      />
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium">
                    {{ project.name }}
                  </VListItemTitle>
                  <VListItemSubtitle>{{ project.info }} &bull; {{ project.lat.toFixed(4) }}, {{ project.lon.toFixed(4) }}</VListItemSubtitle>
                </VListItem>
              </VList>
            </template>
            <div
              v-else
              ref="mapContainer"
              class="map-container-large rounded-lg"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 3: Weather Sidebar + Active Orders List -->
    <VRow>
      <!-- Weather Sidebar -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100 d-flex flex-column">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-cloud"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Pogoda na projektach</VCardTitle>
            <VCardSubtitle>Warunki terenowe</VCardSubtitle>
          </VCardItem>
          <VCardText class="flex-grow-1 overflow-y-auto weather-sidebar-content">
            <div class="d-flex flex-column gap-3">
              <VCard
                v-for="weather in (weatherData as WeatherData[])"
                :key="weather.project_name"
                variant="tonal"
                :color="selectedProjectName === weather.project_name ? 'primary' : getWeatherColor(weather.current.icon)"
                class="weather-card"
                :class="{ 'weather-card--selected': selectedProjectName === weather.project_name }"
                @click="flyToProject(weather)"
              >
                <VCardText class="pa-3">
                  <!-- Header -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="flex-grow-1">
                      <h6 class="text-subtitle-2 font-weight-bold mb-0">
                        {{ weather.project_name }}
                      </h6>
                      <span class="text-caption text-capitalize">
                        {{ weather.current.description }}
                      </span>
                    </div>
                    <div class="text-center ms-3">
                      <VIcon
                        :icon="getWeatherIcon(weather.current.icon)"
                        size="32"
                        :color="getWeatherColor(weather.current.icon)"
                      />
                    </div>
                  </div>

                  <!-- Temp + details row -->
                  <div class="d-flex align-center gap-3">
                    <div class="d-flex align-end gap-1">
                      <span class="text-h5 font-weight-bold line-height-1">
                        {{ weather.current.temp }}
                      </span>
                      <span class="text-body-2 font-weight-medium pb-1">
                        &deg;C
                      </span>
                    </div>
                    <div class="d-flex gap-2">
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-droplet"
                          size="12"
                          color="info"
                        />
                        <span class="text-caption">{{ weather.current.humidity }}%</span>
                      </div>
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-wind"
                          size="12"
                          color="info"
                        />
                        <span class="text-caption">{{ weather.current.wind }} km/h</span>
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Today's Orders List -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-list-check"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Zlecenia na dzisiaj</VCardTitle>
            <VCardSubtitle>{{ todaysOrders.length }} zlecen do wykonania</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <template v-if="todaysOrders.length === 0">
              <VAlert
                type="info"
                variant="tonal"
              >
                Brak zlecen na dzisiaj
              </VAlert>
            </template>
            <VList v-else>
              <VListItem
                v-for="order in todaysOrders"
                :key="order.id"
                class="border-b"
              >
                <template #prepend>
                  <VAvatar
                    :color="getOrderStatusColor(order.status)"
                    variant="tonal"
                    rounded
                    size="40"
                  >
                    <VIcon
                      icon="tabler-clipboard-check"
                      size="20"
                    />
                  </VAvatar>
                </template>
                <VListItemTitle class="font-weight-medium">
                  {{ order.name }}
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ order.location }}
                </VListItemSubtitle>
                <template #append>
                  <VChip
                    :color="getOrderStatusColor(order.status)"
                    size="small"
                    label
                  >
                    {{ getOrderStatusLabel(order.status) }}
                  </VChip>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.map-container-large {
  block-size: 640px;
  inline-size: 100%;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.weather-sidebar-content {
  max-block-size: 600px;
}

.weather-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &--selected {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 1px;
  }
}

.line-height-1 {
  line-height: 1;
}

.legend-dot {
  display: inline-block;
  block-size: 10px;
  border-radius: 50%;
  inline-size: 10px;

  &--green {
    background: #4caf50;
    box-shadow: 0 0 4px 1px rgba(76, 175, 80, 0.5);
  }

  &--orange {
    background: #ff9800;
  }

  &--grey {
    background: #9e9e9e;
  }

  &--red {
    background: #e53935;
  }

  &--blue {
    background: #2196f3;
  }
}
</style>

<style lang="scss">
.marker-pulsing {
  animation: pulse-ring 2s ease-out infinite;
}

.marker-highlighted {
  animation: highlight-bounce 0.6s ease-out;
  outline: 3px solid #7367f0 !important;
  outline-offset: 2px;
  transform: scale(1.4);
  z-index: 10 !important;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes highlight-bounce {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.6);
  }

  100% {
    transform: scale(1.4);
  }
}
</style>
