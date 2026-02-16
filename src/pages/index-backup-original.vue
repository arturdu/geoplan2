<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'
import { orders, posts, projects, users, weatherData } from '@/data/mock'
import { postCategoryColors, postCategoryLabels } from '@/types'
import type { WeatherData } from '@/types'
import { hexToRgb } from '@layouts/utils'
import OrderProgressWidget from '@/components/OrderProgressWidget.vue'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── Stats ──────────────────────────────────────────────
const activeContracts = projects.filter(p => !p.closed && !p.completed).length
const inProgressOrders = orders.filter(o => o.status === 'in_progress').length
const pendingInspections = orders.filter(o => o.i_status === 'called').length

const completedThisMonth = computed(() => {
  const now = new Date()

  return orders.filter(o => {
    if (o.status !== 'completed' || !o.execute_date)
      return false
    const d = new Date(o.execute_date)

    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})

const statCards = computed(() => [
  {
    title: 'Aktywne Kontrakty',
    stats: String(activeContracts),
    icon: 'tabler-building-bridge-2',
    color: 'primary',
    trend: '+2',
    trendUp: true,
    subtitle: 'vs. poprzedni miesiac',
  },
  {
    title: 'Zlecenia w toku',
    stats: String(inProgressOrders),
    icon: 'tabler-progress',
    color: 'info',
    trend: '+12%',
    trendUp: true,
    subtitle: 'aktywnych prac terenowych',
  },
  {
    title: 'Oczekujace na inspekcje',
    stats: String(pendingInspections),
    icon: 'tabler-clipboard-check',
    color: 'warning',
    trend: '-3',
    trendUp: false,
    subtitle: 'do kontroli inspektora',
  },
  {
    title: 'Wykonane ten miesiac',
    stats: String(completedThisMonth.value),
    icon: 'tabler-circle-check',
    color: 'success',
    trend: '+8%',
    trendUp: true,
    subtitle: 'zamkniete zlecenia',
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
  if (icon.startsWith('01'))
    return 'warning'
  if (icon.startsWith('02') || icon.startsWith('03'))
    return 'info'
  if (icon.startsWith('09') || icon.startsWith('10'))
    return 'primary'
  if (icon.startsWith('13'))
    return 'secondary'

  return 'info'
}

// ── Monthly Orders Chart (Area with gradient) ─────────
const monthLabels = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paz', 'Lis', 'Gru']

const monthlyCompleted = computed(() => {
  const counts = Array(12).fill(0)

  orders.forEach(o => {
    if (o.status === 'completed') {
      const date = new Date(o.created_at)
      if (date.getFullYear() === 2025)
        counts[date.getMonth()]++
    }
  })

  return counts
})

const monthlyPending = computed(() => {
  const counts = Array(12).fill(0)

  orders.forEach(o => {
    if (o.status === 'pending' || o.status === 'in_progress') {
      const date = new Date(o.created_at)
      if (date.getFullYear() === 2025)
        counts[date.getMonth()]++
    }
  })

  return counts
})

const totalOrdersThisYear = computed(() => {
  return orders.filter(o => {
    const d = new Date(o.created_at)

    return d.getFullYear() === 2025
  }).length
})

const avgPerMonth = computed(() => {
  const monthsWithData = monthlyCompleted.value.filter(c => c > 0).length || 1

  return Math.round(monthlyCompleted.value.reduce((a, b) => a + b, 0) / monthsWithData)
})

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      parentHeightOffset: 0,
      stacked: false,
    },
    stroke: {
      width: [3, 3],
      curve: 'smooth' as const,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: 0.44,
        opacityTo: 0.05,
        stops: [0, 80, 100],
      },
    },
    colors: [currentTheme.success, currentTheme.warning],
    dataLabels: { enabled: false },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      labels: { colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['high-emphasis-opacity']})` },
      markers: { offsetX: -2 },
      itemMargin: { horizontal: 10 },
    },
    grid: {
      borderColor: `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`,
      padding: { top: -10, bottom: -8, left: 4, right: 8 },
    },
    xaxis: {
      categories: monthLabels,
      labels: {
        style: {
          colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      shared: true,
      y: { formatter: (val: number) => `${val} zlecen` },
    },
  }
})

const chartSeries = computed(() => [
  { name: 'Wykonane', data: monthlyCompleted.value },
  { name: 'Oczekujace / W toku', data: monthlyPending.value },
])

// ── Map ────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const mapContainer = ref<HTMLElement | null>(null)
const mapLoaded = ref(false)
const mapLoadError = ref(false)

const activeProjectLocations = computed(() =>
  projects.filter(p => !p.closed && p.lat && p.lon),
)

// Surveyors with GPS
const surveyorsWithLocation = computed(() =>
  users.filter(u => u.type === 'surveyor' && u.lon && u.lat),
)

// Project status helpers
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

    if (hasOverdue)
      return '#E53935'
  }

  const hasInProgress = projectOrders.some(o => o.status === 'in_progress')
  if (hasInProgress)
    return '#4CAF50'

  const hasPending = projectOrders.some(o => o.status === 'pending')
  if (hasPending)
    return '#FF9800'

  return '#9E9E9E'
}

// Map instance ref for flyTo
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
  if (!project || !mapInstance)
    return

  selectedProjectName.value = weather.project_name

  // Reset previous highlight
  if (highlightedMarkerEl) {
    highlightedMarkerEl.classList.remove('marker-highlighted')
    highlightedMarkerEl = null
  }

  mapInstance.flyTo({
    center: [project.lon, project.lat],
    zoom: 12,
    speed: 1.2,
  })

  // Highlight the marker
  const marker = projectMarkers.get(project.id)
  if (marker) {
    const el = marker.getElement()

    el.classList.add('marker-highlighted')
    highlightedMarkerEl = el
    marker.togglePopup()
  }
}

onMounted(async () => {
  if (!mapContainer.value)
    return

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

      // Project markers with status colors
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

      // Custom marker element for pulsing effect
      const el = document.createElement('div')

      el.className = 'project-marker'
      el.style.cssText = `width: 18px; height: 18px; background: ${color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;`

      if (isActive)
        el.classList.add('marker-pulsing')

      const marker = new mapboxgl.default.Marker({ element: el })
        .setLngLat([project.lon, project.lat])
        .setPopup(popup)
        .addTo(map)

        projectMarkers.set(project.id, marker)
      })

      // Surveyor markers (blue person icons)
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

// ── Order Progress Widget ─────────────────────────────
const activeProjectsWithOrders = computed(() =>
  projects.filter(p => !p.closed && !p.completed && getProjectOrders(p.id).length > 0),
)

// ── Latest posts ───────────────────────────────────────
const sortedPosts = computed(() =>
  [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
)

const getPostIcon = (category: string) => {
  const icons: Record<string, string> = {
    sport: 'tabler-ball-football',
    contracts: 'tabler-file-text',
    events: 'tabler-calendar-event',
    info: 'tabler-info-circle',
    other: 'tabler-dots',
  }

  return icons[category] || 'tabler-info-circle'
}

const isNew = (post: Post) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return new Date(post.created_at) > sevenDaysAgo
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pl-PL')
}

const getExcerpt = (html: string) => {
  const text = html.replace(/<[^>]*>/g, '')
  return text.length > 200 ? text.substring(0, 200) + '...' : text
}
</script>

<template>
  <div>
    <!-- Row 1: Stat Cards -->
    <VRow class="mb-6">
      <VCol
        v-for="card in statCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="pa-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <VAvatar
                :color="card.color"
                variant="tonal"
                rounded
                size="36"
              >
                <VIcon
                  :icon="card.icon"
                  size="20"
                />
              </VAvatar>

              <VChip
                :color="card.trendUp ? 'success' : 'error'"
                size="x-small"
                label
              >
                <VIcon
                  :icon="card.trendUp ? 'tabler-chevron-up' : 'tabler-chevron-down'"
                  size="12"
                  start
                />
                {{ card.trend }}
              </VChip>
            </div>

            <div>
              <h6 class="text-h6 font-weight-bold">
                {{ card.stats }}
              </h6>
              <div class="text-body-2 font-weight-medium">
                {{ card.title }}
              </div>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ card.subtitle }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 2: Map (md=8) + Weather Sidebar (md=4) -->
    <VRow class="mb-6">
      <!-- Map -->
      <VCol
        cols="12"
        md="8"
      >
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
            <VCardTitle>Mapa projektow i geodetow</VCardTitle>
            <VCardSubtitle>{{ activeProjectLocations.length }} projektow &bull; {{ surveyorsWithLocation.length }} geodetow w terenie</VCardSubtitle>
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
              class="map-container rounded-lg"
            />
          </VCardText>
        </VCard>
      </VCol>

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
            <VCardSubtitle>Kliknij aby przejsc na mapie</VCardSubtitle>
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
                <VCardText class="pa-4">
                  <!-- Header -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="flex-grow-1">
                      <h6 class="text-subtitle-1 font-weight-bold mb-0">
                        {{ weather.project_name }}
                      </h6>
                      <span class="text-caption text-capitalize">
                        {{ weather.current.description }}
                      </span>
                    </div>
                    <div class="text-center ms-3">
                      <VIcon
                        :icon="getWeatherIcon(weather.current.icon)"
                        size="36"
                        :color="getWeatherColor(weather.current.icon)"
                      />
                    </div>
                  </div>

                  <!-- Temp + details row -->
                  <div class="d-flex align-center gap-4">
                    <div class="d-flex align-end gap-1">
                      <span class="text-h4 font-weight-bold line-height-1">
                        {{ weather.current.temp }}
                      </span>
                      <span class="text-body-1 font-weight-medium pb-1">
                        &deg;C
                      </span>
                    </div>
                    <div class="d-flex gap-3">
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-droplet"
                          size="14"
                          color="info"
                        />
                        <span class="text-caption">{{ weather.current.humidity }}%</span>
                      </div>
                      <div class="d-flex align-center gap-1">
                        <VIcon
                          icon="tabler-wind"
                          size="14"
                          color="info"
                        />
                        <span class="text-caption">{{ weather.current.wind }} km/h</span>
                      </div>
                    </div>
                  </div>

                  <!-- Compact forecast -->
                  <VDivider class="my-2" />
                  <div class="d-flex justify-space-between">
                    <div
                      v-for="day in weather.forecast"
                      :key="day.day"
                      class="text-center"
                    >
                      <div class="text-caption font-weight-medium text-medium-emphasis">
                        {{ day.day }}
                      </div>
                      <VIcon
                        :icon="getWeatherIcon(day.icon)"
                        size="18"
                        class="my-1"
                        :color="getWeatherColor(day.icon)"
                      />
                      <div class="text-caption font-weight-bold">
                        {{ day.temp }}&deg;
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 3: Order Progress Widget -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-chart-pie"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Progress po zleceniach</VCardTitle>
            <VCardSubtitle>Postep realizacji na aktywnych projektach</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VRow>
              <VCol
                v-for="project in activeProjectsWithOrders"
                :key="project.id"
                cols="12"
                sm="6"
                md="4"
              >
                <OrderProgressWidget
                  :project="project"
                  :orders="getProjectOrders(project.id)"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 4: Monthly Orders Chart -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard class="d-flex flex-column">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-chart-area-line"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Zlecenia 2025</VCardTitle>
            <VCardSubtitle>Wykonane vs oczekujace</VCardSubtitle>
          </VCardItem>

          <VCardText class="flex-grow-1">
            <!-- Summary stats row -->
            <div class="d-flex gap-6 mb-4">
              <div class="border rounded pa-3 flex-grow-1 text-center">
                <div class="text-caption text-medium-emphasis">
                  Suma roczna
                </div>
                <div class="text-h5 font-weight-bold text-primary">
                  {{ totalOrdersThisYear }}
                </div>
              </div>
              <div class="border rounded pa-3 flex-grow-1 text-center">
                <div class="text-caption text-medium-emphasis">
                  Srednia / mies.
                </div>
                <div class="text-h5 font-weight-bold text-success">
                  {{ avgPerMonth }}
                </div>
              </div>
            </div>

            <VueApexCharts
              :options="chartOptions"
              :series="chartSeries"
              height="310"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 5: GeoFun Posts -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-news"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Ostatnie posty GeoFun</VCardTitle>
            <VCardSubtitle>Aktualnosci zespolu</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VRow>
              <VCol
                v-for="post in sortedPosts"
                :key="post.id"
                cols="12"
              >
                <VCard
                  class="post-card-horizontal"
                  :class="{ 'post-unread': !post.read }"
                >
                  <div class="d-flex">
                    <!-- Left: Icon/Category -->
                    <div class="post-icon-section">
                      <VAvatar
                        size="56"
                        :color="postCategoryColors[post.category]"
                        variant="tonal"
                      >
                        <VIcon
                          :icon="getPostIcon(post.category)"
                          size="32"
                        />
                      </VAvatar>
                    </div>

                    <!-- Right: Content -->
                    <div class="flex-grow-1 pa-4">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <div class="d-flex align-center gap-2">
                          <VChip
                            :color="postCategoryColors[post.category]"
                            size="small"
                          >
                            {{ postCategoryLabels[post.category] }}
                          </VChip>
                          <VChip
                            v-if="isNew(post)"
                            color="success"
                            size="small"
                          >
                            NEW
                          </VChip>
                          <VIcon
                            v-if="!post.read"
                            icon="tabler-circle-filled"
                            size="8"
                            color="primary"
                          />
                        </div>
                        <span class="text-caption">{{ formatDate(post.created_at) }}</span>
                      </div>
                      <h6 class="text-h6 mb-1">
                        {{ post.title }}
                      </h6>
                      <p class="text-body-2 text-medium-emphasis mb-2">
                        {{ getExcerpt(post.body) }}
                      </p>
                      <div class="text-caption">
                        <VIcon
                          icon="tabler-user"
                          size="14"
                          class="me-1"
                        />
                        {{ post.author.full_name }}
                      </div>
                    </div>
                  </div>
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
.map-container {
  block-size: 520px;
  inline-size: 100%;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.weather-sidebar-content {
  max-block-size: 560px;
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

.post-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.post-card-horizontal {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .post-icon-section {
    padding: 16px;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  &.post-unread {
    border-left: 3px solid rgb(var(--v-theme-primary));
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

// Legend dots
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
// Global (unscoped) styles for map markers
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
