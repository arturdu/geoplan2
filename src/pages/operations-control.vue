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

// ── Weather icon mapping (uproszczone do ikon które 100% działają) ───────────────────────────────
const weatherIconMap: Record<string, string> = {
  '01d': 'tabler-sun',
  '01n': 'tabler-moon',
  '02d': 'tabler-cloud',
  '02n': 'tabler-cloud',
  '03d': 'tabler-cloud',
  '03n': 'tabler-cloud',
  '04d': 'tabler-cloud',
  '04n': 'tabler-cloud',
  '09d': 'tabler-cloud-rain',
  '09n': 'tabler-cloud-rain',
  '10d': 'tabler-cloud-rain',
  '10n': 'tabler-cloud-rain',
  '13d': 'tabler-snowflake',
  '13n': 'tabler-snowflake',
  '50d': 'tabler-cloud',
  '50n': 'tabler-cloud',
}

const getWeatherIcon = (icon: string) => {
  if (!icon) return 'tabler-cloud'
  return weatherIconMap[icon] || 'tabler-cloud'
}

const getWeatherColor = (icon: string): string => {
  if (!icon) return 'info'
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
const surveyorMarkers: Map<number, any> = new Map()
const selectedProjectName = ref<string | null>(null)
let highlightedMarkerEl: HTMLElement | null = null
let destinationLineLayerId: string | null = null

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

function flyToSurveyor(surveyor: any) {
  if (!mapInstance || !surveyor.lon || !surveyor.lat) return

  mapInstance.flyTo({
    center: [surveyor.lon, surveyor.lat],
    zoom: 14,
    speed: 1.2,
  })

  const marker = surveyorMarkers.get(surveyor.id)
  if (marker) {
    marker.togglePopup()
  }
}

function removeDestinationLine() {
  if (!mapInstance || !destinationLineLayerId) return

  if (mapInstance.getLayer(destinationLineLayerId)) {
    mapInstance.removeLayer(destinationLineLayerId)
  }
  if (mapInstance.getSource(destinationLineLayerId)) {
    mapInstance.removeSource(destinationLineLayerId)
  }
  destinationLineLayerId = null
}

function showDestinationLine(surveyor: any) {
  if (!mapInstance || !surveyor.currentOrder) return

  const order = surveyor.currentOrder
  const project = projects.find(p => p.id === order.project_id)
  if (!project || !project.lon || !project.lat) return

  removeDestinationLine()

  const lineId = `destination-line-${surveyor.id}`
  destinationLineLayerId = lineId

  mapInstance.addSource(lineId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [surveyor.lon, surveyor.lat],
          [project.lon, project.lat],
        ],
      },
    },
  })

  mapInstance.addLayer({
    id: lineId,
    type: 'line',
    source: lineId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#2196F3',
      'line-width': 3,
      'line-dasharray': [2, 2],
    },
  })
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
              <span style="color: #FF9800;">&#9679;</span> Oczekujące: <b>${pending}</b><br/>
              <span style="color: #9E9E9E;">&#9679;</span> Wykonane: <b>${completed}</b><br/>
              <span style="color: #999; font-size: 11px;">Suma zleceń: ${project.orders_count}</span>
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

      surveyorMarkers.forEach(marker => marker.remove())
      surveyorMarkers.clear()

      surveyorsWithLocation.value.forEach(surveyor => {
        const surveyorData = activeFieldTeams.value.find(t => t.id === surveyor.id)
        const updatedAt = surveyor.location_updated_at
          ? new Date(surveyor.location_updated_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
          : 'brak danych'

        // Determine border color based on order status
        let borderColor = '#9E9E9E' // Gray - no order
        let statusLabel = 'Brak zlecenia'
        if (surveyorData?.currentOrder) {
          const orderStatus = surveyorData.currentOrder.status
          if (orderStatus === 'in_progress') {
            borderColor = '#4CAF50' // Green - driving/working
            statusLabel = 'W trasie'
          } else if (orderStatus === 'pending') {
            borderColor = '#FF9800' // Orange - waiting
            statusLabel = 'Oczekuje'
          } else if (orderStatus === 'completed') {
            borderColor = '#2196F3' // Blue - completed
            statusLabel = 'Zakończone'
          }
        }

        // Get initials for avatar
        const nameParts = surveyor.full_name.split(' ')
        const initials = nameParts.length >= 2
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : surveyor.full_name.substring(0, 2).toUpperCase()

        // Generate avatar URL from UI Avatars API
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(surveyor.full_name)}&size=128&background=${borderColor.replace('#', '')}&color=fff&bold=true&format=png`

        let popupContent = `<div style="padding: 4px 2px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%;" alt="${surveyor.full_name}">
              <strong style="font-size: 13px;">${surveyor.full_name}</strong>
            </div>
            <div style="font-size: 11px; color: #666;">
              Status: <b style="color: ${borderColor};">${statusLabel}</b><br/>
              Ostatnia aktualizacja: <b>${updatedAt}</b>
            </div>`

        if (surveyorData?.currentOrder) {
          popupContent += `<div style="margin-top: 8px; font-size: 11px; padding: 4px; background: #f5f5f5; border-radius: 4px;">
              <div style="color: #666;">Cel: <b>${surveyorData.currentOrder.description}</b></div>
              <div style="color: #999;">${surveyorData.currentOrder.location}</div>
            </div>`
        }

        popupContent += `</div>`

        const popup = new mapboxgl.default.Popup({ offset: 20, maxWidth: '240px' }).setHTML(popupContent)

        // Create avatar marker with colored border and actual image
        const el = document.createElement('div')
        el.className = 'surveyor-marker'
        el.style.cssText = `width: 40px; height: 40px; background: white; border-radius: 50%; border: 3px solid ${borderColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: box-shadow 0.3s ease; position: relative;`

        // Avatar image
        const avatar = document.createElement('img')
        avatar.src = avatarUrl
        avatar.alt = surveyor.full_name
        avatar.style.cssText = `width: 32px; height: 32px; border-radius: 50%; object-fit: cover;`
        el.appendChild(avatar)

        // Create hover tooltip - theme aware colors
        const isDark = vuetifyTheme.current.value.dark
        const bgColor = isDark ? '#1e1e1e' : '#ffffff'
        const textColor = isDark ? '#e0e0e0' : '#333333'
        const labelColor = isDark ? '#a0a0a0' : '#666666'
        const tooltipBorderColor = borderColor
        const dividerColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#eeeeee'

        const tooltip = document.createElement('div')
        tooltip.className = 'surveyor-hover-tooltip'
        tooltip.style.cssText = `display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 15px; background: ${bgColor}; border: 2px solid ${tooltipBorderColor}; border-radius: 8px; padding: 8px 12px; min-width: 200px; box-shadow: 0 4px 16px rgba(0,0,0,${isDark ? '0.7' : '0.4'}); z-index: 1000; pointer-events: none;`

        if (surveyorData?.currentOrder) {
          const project = projects.find(p => p.id === surveyorData.currentOrder.project_id)
          tooltip.innerHTML = `
            <div style="font-size: 11px; line-height: 1.6;">
              <div style="font-weight: bold; color: #2196F3; margin-bottom: 6px; font-size: 12px;">📍 Cel podróży</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid ${dividerColor};">
                  <td style="color: ${labelColor}; padding: 2px 4px 2px 0; font-weight: 500;">Zlecenie:</td>
                  <td style="color: ${textColor}; padding: 2px 0; font-weight: bold;">${surveyorData.currentOrder.description}</td>
                </tr>
                <tr style="border-bottom: 1px solid ${dividerColor};">
                  <td style="color: ${labelColor}; padding: 2px 4px 2px 0; font-weight: 500;">Lokalizacja:</td>
                  <td style="color: ${textColor}; padding: 2px 0;">${surveyorData.currentOrder.location}</td>
                </tr>
                ${project ? `<tr>
                  <td style="color: ${labelColor}; padding: 2px 4px 2px 0; font-weight: 500;">Projekt:</td>
                  <td style="color: ${textColor}; padding: 2px 0;">${project.name}</td>
                </tr>` : ''}
              </table>
            </div>
          `
        } else {
          tooltip.innerHTML = `
            <div style="font-size: 11px; color: ${labelColor}; text-align: center;">
              <div style="font-weight: bold; color: ${labelColor};">Brak aktywnego zlecenia</div>
            </div>
          `
        }

        el.appendChild(tooltip)

        el.addEventListener('mouseenter', () => {
          el.style.boxShadow = `0 4px 20px ${borderColor}99, 0 0 0 4px ${borderColor}33`
          tooltip.style.display = 'block'
          if (surveyorData?.currentOrder) {
            showDestinationLine(surveyorData)
          }
        })

        el.addEventListener('mouseleave', () => {
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
          tooltip.style.display = 'none'
          removeDestinationLine()
        })

        const marker = new mapboxgl.default.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([surveyor.lon!, surveyor.lat!])
          .setPopup(popup)
          .addTo(map)

        surveyorMarkers.set(surveyor.id, marker)
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

    <!-- ROW 2: Weather Monitoring (moved above map) -->
    <VRow class="mb-6">
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

    <!-- ROW 3: Map + Live Field Teams -->
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
                variant="outlined"
                class="field-team-card"
                @click="flyToSurveyor(team)"
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
                      {{ team.currentOrder.description }}
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
  </div>
</template>

<style lang="scss" scoped>
.control-center-dashboard {
  // Hero stat cards with gradient and hover effect
  .hero-stat-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow: visible;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

      .hero-stat-icon {
        transform: scale(1.1) rotate(5deg);
      }
    }

    .hero-stat-icon {
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    h3 {
      color: rgba(var(--v-theme-on-surface), 0.95);
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
    border-color: rgba(var(--v-border-color), var(--v-border-opacity));

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
      border-color: rgb(var(--v-theme-primary));
    }

    .text-subtitle-1 {
      color: rgba(var(--v-theme-on-surface), 0.95);
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

    .text-subtitle-1 {
      color: rgba(var(--v-theme-on-surface), 0.95);
    }

    .text-h3 {
      color: rgba(var(--v-theme-on-surface), 0.95);
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
