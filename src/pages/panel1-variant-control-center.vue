<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'
import { orders, projects, users, weatherData } from '@/data/mock'
import type { WeatherData } from '@/types'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── PANEL 1 VARIANT: "Terenowy Control Center" ────────
// Focus: Real-time operations, GPS tracking, weather monitoring

// ── Hero Stats - Large Impact Numbers ─────────────────
const activeTeamsInField = computed(() =>
  users.filter(u => u.type === 'surveyor' && u.is_active && u.lon && u.lat).length
)

const activeMissions = computed(() =>
  orders.filter(o => o.status === 'in_progress').length
)

const weatherAlertsCount = computed(() => {
  let alerts = 0
  weatherData.forEach(w => {
    if (w.current.temp < 0 || w.current.wind > 30) alerts++
    if (w.current.icon.startsWith('09') || w.current.icon.startsWith('10') || w.current.icon.startsWith('13')) alerts++
  })
  return alerts
})

const avgResponseTime = computed(() => {
  // Mock calculation - in real app this would be computed from actual data
  return '2.4h'
})

// ── Hero Cards (Big, Bold, Eye-catching) ──────────────
const heroStats = computed(() => [
  {
    title: 'Ekipy w Terenie',
    value: activeTeamsInField.value,
    subtitle: 'aktywnych geodetów',
    icon: 'tabler-users',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: '+12%',
    trendUp: true,
  },
  {
    title: 'Misje Dzisiaj',
    value: activeMissions.value,
    subtitle: 'trwające zlecenia',
    icon: 'tabler-target',
    color: 'success',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: '+8',
    trendUp: true,
  },
  {
    title: 'Alerty Pogodowe',
    value: weatherAlertsCount.value,
    subtitle: 'wymaga uwagi',
    icon: 'tabler-alert-triangle',
    color: weatherAlertsCount.value > 0 ? 'warning' : 'info',
    gradient: weatherAlertsCount.value > 0
      ? 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)'
      : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    trend: weatherAlertsCount.value > 0 ? 'UWAGA' : 'OK',
    trendUp: weatherAlertsCount.value === 0,
  },
  {
    title: 'Czas Reakcji',
    value: avgResponseTime.value,
    subtitle: 'średnia dziś',
    icon: 'tabler-clock-bolt',
    color: 'info',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: '-15%',
    trendUp: true,
  },
])

// ── Real-time GPS Tracking Cards ──────────────────────
const activeFieldTeams = computed(() =>
  users.filter(u => u.type === 'surveyor' && u.is_active && u.lon && u.lat).map(u => ({
    ...u,
    currentOrder: orders.find(o => o.assigned_to === u.id && o.status === 'in_progress'),
    lastUpdate: u.location_updated_at ? new Date(u.location_updated_at) : null,
  }))
)

const getTimeSinceUpdate = (date: Date | null) => {
  if (!date) return 'brak danych'
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diff < 1) return 'teraz'
  if (diff < 60) return `${diff} min temu`
  return `${Math.floor(diff / 60)}h ${diff % 60}m temu`
}

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

    addMarkers()

    watch(() => vuetifyTheme.current.value.dark, (isDark) => {
      if (map) {
        map.setStyle(isDark
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11'
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
  <div class="control-center-dashboard">
    <!-- ROW 1: Hero Stats - Large, Eye-catching Cards -->
    <VRow class="mb-6">
      <VCol
        v-for="stat in heroStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="hero-stat-card">
          <VCardText class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <VAvatar
                :color="stat.color"
                variant="flat"
                size="56"
                rounded
                :style="{ background: stat.gradient }"
                class="hero-stat-icon"
              >
                <VIcon
                  :icon="stat.icon"
                  size="32"
                  color="white"
                />
              </VAvatar>
              <VChip
                :color="stat.trendUp ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                <VIcon
                  :icon="stat.trendUp ? 'tabler-trending-up' : 'tabler-trending-down'"
                  size="14"
                  start
                />
                {{ stat.trend }}
              </VChip>
            </div>
            <div>
              <h3 class="text-h3 font-weight-bold mb-2">
                {{ stat.value }}
              </h3>
              <div class="text-body-1 font-weight-medium text-high-emphasis mb-1">
                {{ stat.title }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ stat.subtitle }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 2: Map + Live Field Teams -->
    <VRow class="mb-6">
      <!-- Main Map -->
      <VCol
        cols="12"
        lg="8"
      >
        <VCard class="h-100 map-control-card">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-map-2"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Centrum Kontroli Terenu
            </VCardTitle>
            <VCardSubtitle>
              {{ activeProjectLocations.length }} projektów • {{ surveyorsWithLocation.length }} geodetów na żywo
            </VCardSubtitle>
            <template #append>
              <VChip
                color="success"
                size="small"
                variant="tonal"
              >
                <div class="d-flex align-center gap-1">
                  <span class="live-dot" />
                  <span>LIVE</span>
                </div>
              </VChip>
            </template>
          </VCardItem>
          <VCardText>
            <div class="d-flex flex-wrap gap-3 mb-3">
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--green" />
                <span class="text-caption">Aktywne</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--orange" />
                <span class="text-caption">Oczekujące</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--grey" />
                <span class="text-caption">Wykonane</span>
              </div>
              <div class="d-flex align-center gap-1">
                <span class="legend-dot legend-dot--red" />
                <span class="text-caption">Problem</span>
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
              >
                Nie udało się załadować mapy
              </VAlert>
            </template>
            <div
              v-else
              ref="mapContainer"
              class="map-container-large rounded-lg"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Live Field Teams Sidebar -->
      <VCol
        cols="12"
        lg="4"
      >
        <VCard class="h-100 d-flex flex-column">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-radar"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Ekipy w Terenie
            </VCardTitle>
            <VCardSubtitle>GPS Tracking na żywo</VCardSubtitle>
          </VCardItem>
          <VCardText class="flex-grow-1 overflow-y-auto field-teams-container">
            <div class="d-flex flex-column gap-3">
              <VCard
                v-for="team in activeFieldTeams"
                :key="team.id"
                variant="tonal"
                color="primary"
                class="field-team-card"
              >
                <VCardText class="pa-4">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center gap-3">
                      <VAvatar
                        size="48"
                        color="primary"
                      >
                        <VIcon
                          icon="tabler-user"
                          size="24"
                        />
                      </VAvatar>
                      <div>
                        <h6 class="text-subtitle-1 font-weight-bold mb-1">
                          {{ team.full_name }}
                        </h6>
                        <div class="d-flex align-center gap-1">
                          <VIcon
                            icon="tabler-map-pin"
                            size="12"
                            color="success"
                          />
                          <span class="text-caption">
                            {{ getTimeSinceUpdate(team.lastUpdate) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <VChip
                      color="success"
                      size="small"
                      variant="flat"
                    >
                      <div class="d-flex align-center gap-1">
                        <span class="live-dot" />
                        <span>AKTYWNY</span>
                      </div>
                    </VChip>
                  </div>

                  <VDivider class="my-2" />

                  <div v-if="team.currentOrder">
                    <div class="text-caption text-medium-emphasis mb-1">
                      Aktualna misja:
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ team.currentOrder.name }}
                    </div>
                    <div class="text-caption">
                      {{ team.currentOrder.location }}
                    </div>
                  </div>
                  <div v-else>
                    <div class="text-caption text-medium-emphasis">
                      Brak przypisanego zlecenia
                    </div>
                  </div>

                  <div class="mt-3 d-flex gap-2">
                    <VBtn
                      size="small"
                      variant="outlined"
                      color="primary"
                      prepend-icon="tabler-phone"
                    >
                      Kontakt
                    </VBtn>
                    <VBtn
                      size="small"
                      variant="tonal"
                      color="primary"
                      icon="tabler-map-pin"
                    />
                  </div>
                </VCardText>
              </VCard>

              <template v-if="activeFieldTeams.length === 0">
                <VAlert
                  type="info"
                  variant="tonal"
                >
                  Brak aktywnych ekip w terenie
                </VAlert>
              </template>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 3: Weather Monitoring -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-cloud"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Monitoring Pogody
            </VCardTitle>
            <VCardSubtitle>Warunki terenowe na projektach - kliknij aby zlokalizować na mapie</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VRow>
              <VCol
                v-for="weather in (weatherData as WeatherData[])"
                :key="weather.project_name"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <VCard
                  variant="tonal"
                  :color="selectedProjectName === weather.project_name ? 'primary' : getWeatherColor(weather.current.icon)"
                  class="weather-control-card"
                  :class="{ 'weather-control-card--selected': selectedProjectName === weather.project_name }"
                  @click="flyToProject(weather)"
                >
                  <VCardText class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="flex-grow-1">
                        <h6 class="text-subtitle-1 font-weight-bold mb-1">
                          {{ weather.project_name }}
                        </h6>
                        <span class="text-caption text-capitalize">
                          {{ weather.current.description }}
                        </span>
                      </div>
                      <VAvatar
                        :color="getWeatherColor(weather.current.icon)"
                        size="56"
                        variant="flat"
                      >
                        <VIcon
                          :icon="getWeatherIcon(weather.current.icon)"
                          size="36"
                          color="white"
                        />
                      </VAvatar>
                    </div>

                    <div class="d-flex align-center gap-3 mb-3">
                      <div class="d-flex align-end gap-1">
                        <span class="text-h3 font-weight-bold line-height-1">
                          {{ weather.current.temp }}
                        </span>
                        <span class="text-h6 font-weight-medium pb-1">
                          °C
                        </span>
                      </div>
                    </div>

                    <div class="d-flex gap-4 mb-3">
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-droplet"
                          size="16"
                          color="info"
                        />
                        <span class="text-body-2">{{ weather.current.humidity }}%</span>
                      </div>
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-wind"
                          size="16"
                          color="info"
                        />
                        <span class="text-body-2">{{ weather.current.wind }} km/h</span>
                      </div>
                    </div>

                    <VDivider class="my-2" />

                    <div class="d-flex justify-space-between">
                      <div
                        v-for="day in weather.forecast.slice(0, 3)"
                        :key="day.day"
                        class="text-center"
                      >
                        <div class="text-caption text-medium-emphasis mb-1">
                          {{ day.day }}
                        </div>
                        <VIcon
                          :icon="getWeatherIcon(day.icon)"
                          size="24"
                          :color="getWeatherColor(day.icon)"
                          class="mb-1"
                        />
                        <div class="text-caption font-weight-bold">
                          {{ day.temp }}°
                        </div>
                      </div>
                    </div>
                  </VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.control-center-dashboard {
  // Hero stat cards with gradient and hover effect
  .hero-stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

      .hero-stat-icon {
        transform: scale(1.1) rotate(5deg);
      }
    }

    .hero-stat-icon {
      transition: transform 0.3s ease;
    }
  }

  // Map card styling
  .map-control-card {
    border: 2px solid rgba(var(--v-theme-primary), 0.2);
  }

  .map-container-large {
    block-size: 560px;
    inline-size: 100%;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  // Field teams container
  .field-teams-container {
    max-block-size: 600px;
  }

  .field-team-card {
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }
  }

  // Weather cards
  .weather-control-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    &--selected {
      outline: 3px solid rgb(var(--v-theme-primary));
      outline-offset: 2px;
      transform: scale(1.02);
    }
  }

  // Live indicator dot
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
      opacity: 1;
    }
    70% {
      box-shadow: 0 0 0 8px currentColor;
      opacity: 0;
    }
    100% {
      box-shadow: 0 0 0 0 currentColor;
      opacity: 0;
    }
  }

  // Legend dots
  .legend-dot {
    display: inline-block;
    block-size: 10px;
    inline-size: 10px;
    border-radius: 50%;

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

  .line-height-1 {
    line-height: 1;
  }
}
</style>

<style lang="scss">
// Map marker animations (global)
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
