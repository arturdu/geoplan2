<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'
import { orders, projects, weatherData } from '@/data/mock'
import {
  inspectorStatusColors,
  inspectorStatusLabels,
  orderStatusColors,
  orderStatusLabels,
} from '@/types'
import type { Order, WeatherData } from '@/types'

const route = useRoute()
const router = useRouter()

// Theme
const vuetifyTheme = useTheme()

// ── Load Order ─────────────────────────────────────────
const orderId = computed(() => Number((route.params as any).id))

const order = computed<Order | undefined>(() =>
  orders.find(o => o.id === orderId.value),
)

const project = computed(() =>
  order.value ? projects.find(p => p.id === order.value!.project_id) : undefined,
)

const hasInspector = computed(() =>
  project.value && project.value.inspector_ids.length > 0,
)

// ── Helpers ────────────────────────────────────────────
const getStatusColor = (status: string) =>
  orderStatusColors[status as keyof typeof orderStatusColors] || 'secondary'

const getStatusLabel = (status: string) =>
  orderStatusLabels[status as keyof typeof orderStatusLabels] || status

const getIStatusColor = (status: string | null) => {
  if (!status)
    return 'grey'

  return inspectorStatusColors[status] || 'grey'
}

const getIStatusLabel = (status: string | null) => {
  if (!status)
    return 'Brak'

  return inspectorStatusLabels[status] || status
}

const goBack = () => {
  router.push('/orders')
}

// ── Weather ────────────────────────────────────────────
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

const projectWeather = computed<WeatherData | undefined>(() => {
  if (!project.value)
    return undefined

  return (weatherData as WeatherData[]).find(w => w.project_name === project.value!.name)
})

// ── Map ────────────────────────────────────────────────
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const mapContainer = ref<HTMLElement | null>(null)
const mapLoaded = ref(false)
const mapLoadError = ref(false)

// Computed map style based on theme
const mapStyle = computed(() =>
  vuetifyTheme.current.value.dark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11'
)

onMounted(async () => {
  if (!mapContainer.value || !project.value)
    return

  try {
    const mapboxgl = await import('mapbox-gl')

    mapboxgl.default.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.default.Map({
      container: mapContainer.value,
      style: mapStyle.value,
      center: [project.value.lon, project.value.lat],
      zoom: 13,
    })

    let marker: any = null

    map.on('load', () => {
      mapLoaded.value = true
    })

    map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

    const addMarker = () => {
      if (marker) {
        marker.remove()
      }

      const el = document.createElement('div')
      el.style.cssText = 'width: 20px; height: 20px; background: #7367F0; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);'

      marker = new mapboxgl.default.Marker({ element: el })
        .setLngLat([project.value!.lon, project.value!.lat])
        .addTo(map)
    }

    // Add marker initially
    addMarker()

    // Watch for theme changes and update map style
    watch(() => vuetifyTheme.current.value.dark, (isDark) => {
      if (map) {
        map.setStyle(isDark
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11'
        )
        // Re-add marker after style change
        map.once('styledata', () => {
          addMarker()
        })
      }
    })
  }
  catch {
    mapLoadError.value = true
  }
})

// ── Quick Stats ────────────────────────────────────────
const projectOrdersCount = computed(() => {
  if (!project.value)
    return 0

  return orders.filter(o => o.project_id === project.value!.id).length
})

// ── Files Table ────────────────────────────────────────
const fileHeaders = [
  { title: 'Nazwa pliku', key: 'file_name' },
  { title: 'Data dodania', key: 'created_at' },
  { title: 'Uzytkownik', key: 'user' },
  { title: 'Status IK', key: 'i_status', sortable: false },
  { title: 'Widoczny IK', key: 'i_visible', sortable: false },
]

const addFileDialog = ref(false)
</script>

<template>
  <div v-if="order">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <div class="d-flex align-center gap-3 mb-1">
          <VIcon
            icon="tabler-clipboard-text"
            size="28"
            color="primary"
          />
          <h4 class="text-h4">
            {{ order.order_no }}
          </h4>
          <VChip
            :color="getStatusColor(order.status)"
            variant="tonal"
            label
          >
            {{ getStatusLabel(order.status) }}
          </VChip>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Szczegoly zlecenia
        </p>
      </div>
      <VBtn
        variant="tonal"
        color="secondary"
        prepend-icon="tabler-arrow-left"
        @click="goBack"
      >
        Powrot do listy
      </VBtn>
    </div>

    <!-- Row 1: Quick Overview -->
    <VRow class="mb-6">
      <!-- Main Info Card -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center pa-5 bg-grey-lighten-4">
            <VAvatar
              color="primary"
              variant="tonal"
              rounded
              class="me-3"
            >
              <VIcon icon="tabler-building" />
            </VAvatar>
            <div>
              <h5 class="text-h5">
                {{ order.contractor?.name || 'Nieznany wykonawca' }}
              </h5>
              <span class="text-body-2 text-medium-emphasis">
                Zlecone przez: {{ order.contractor_user?.full_name || '-' }}
                {{ order.created_at }}
                <span v-if="order.contractor_user?.phone"> (tel. {{ order.contractor_user.phone }})</span>
              </span>
            </div>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-5">
            <VRow>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Projekt
                  </div>
                  <VChip
                    color="warning"
                    variant="tonal"
                    label
                  >
                    {{ order.project?.name || '-' }}
                  </VChip>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Branza
                  </div>
                  <span class="text-body-1">{{ order.trade?.name || '-' }}</span>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Rodzaj
                  </div>
                  <span class="text-body-1">{{ order.type?.name || '-' }}</span>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Lokalizacja
                  </div>
                  <span class="text-body-1">{{ order.location }}</span>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Kilometraz
                  </div>
                  <span class="text-body-1">{{ order.kms || '-' }}</span>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Nr rysunku
                  </div>
                  <span class="text-body-1">{{ order.dwg_no || '-' }}</span>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Opis
                  </div>
                  <span class="text-body-1">{{ order.description || '-' }}</span>
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <div class="mb-4">
                  <div class="text-overline text-medium-emphasis mb-1">
                    Uwagi
                  </div>
                  <span class="text-body-1 text-warning">{{ order.notes || '-' }}</span>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Status Summary Card -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center pa-5 bg-light-primary">
            <VAvatar
              color="primary"
              variant="tonal"
              rounded
              class="me-3"
            >
              <VIcon icon="tabler-chart-dots" />
            </VAvatar>
            <h5 class="text-h5">
              Status
            </h5>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-5">
            <div class="d-flex flex-column gap-5">
              <!-- Status Badge -->
              <div class="text-center">
                <VChip
                  :color="getStatusColor(order.status)"
                  variant="tonal"
                  label
                  size="large"
                  class="font-weight-bold"
                >
                  {{ getStatusLabel(order.status) }}
                </VChip>
              </div>

              <VDivider />

              <!-- Key Dates -->
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Termin realizacji
                </div>
                <VChip
                  v-if="order.completion_date"
                  color="info"
                  variant="tonal"
                  label
                >
                  <VIcon
                    icon="tabler-calendar"
                    size="16"
                    start
                  />
                  {{ order.completion_date }}
                </VChip>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>

              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Data wykonania
                </div>
                <span
                  v-if="order.execute_date"
                  class="text-success font-weight-medium"
                >
                  <VIcon
                    icon="tabler-circle-check"
                    size="16"
                    color="success"
                    class="me-1"
                  />
                  {{ order.execute_date }}
                </span>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>

              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Data utworzenia
                </div>
                <span class="text-body-1">{{ order.created_at }}</span>
              </div>

              <VDivider />

              <!-- Quick Stats -->
              <div class="d-flex justify-space-between">
                <div class="text-center">
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ order.orderMedia?.length || 0 }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Pliki
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-h5 font-weight-bold text-warning">
                    {{ projectOrdersCount }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Zlecenia w proj.
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-h5 font-weight-bold text-info">
                    {{ order.asgroups?.length || 0 }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Asortymenty
                  </div>
                </div>
              </div>

              <!-- Asortymenty chips -->
              <div v-if="order.asgroups && order.asgroups.length > 0">
                <div class="text-overline text-medium-emphasis mb-1">
                  Asortymenty
                </div>
                <div>
                  <VChip
                    v-for="ag in order.asgroups"
                    :key="ag.id"
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="me-1 mb-1"
                  >
                    {{ ag.name }}
                  </VChip>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 2: Map & Weather -->
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
            <VCardTitle>Lokalizacja projektu</VCardTitle>
            <VCardSubtitle>{{ project?.name }} &bull; {{ order.location || '-' }}</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <template v-if="mapLoadError">
              <VAlert
                type="warning"
                variant="tonal"
              >
                Nie udalo sie zaladowac mapy.
                <span v-if="project">Wspolrzedne: {{ project.lat.toFixed(4) }}, {{ project.lon.toFixed(4) }}</span>
              </VAlert>
            </template>
            <div
              v-else
              ref="mapContainer"
              class="order-map-container rounded-lg"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Weather Widget -->
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
            <VCardTitle>Pogoda</VCardTitle>
            <VCardSubtitle>{{ project?.name || '-' }}</VCardSubtitle>
          </VCardItem>
          <VCardText
            v-if="projectWeather"
            class="flex-grow-1 d-flex flex-column"
          >
            <!-- Current weather -->
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="d-flex align-end gap-1 mb-1">
                  <span class="text-h2 font-weight-bold" style="line-height: 1;">
                    {{ projectWeather.current.temp }}
                  </span>
                  <span class="text-h5 font-weight-medium pb-1">&deg;C</span>
                </div>
                <span class="text-body-1 text-capitalize text-medium-emphasis">
                  {{ projectWeather.current.description }}
                </span>
              </div>
              <VAvatar
                :color="getWeatherColor(projectWeather.current.icon)"
                variant="tonal"
                size="64"
                rounded
              >
                <VIcon
                  :icon="getWeatherIcon(projectWeather.current.icon)"
                  size="36"
                />
              </VAvatar>
            </div>

            <!-- Details -->
            <div class="d-flex gap-4 mb-4">
              <div class="d-flex align-center gap-2 border rounded pa-3 flex-grow-1">
                <VIcon
                  icon="tabler-droplet"
                  size="20"
                  color="info"
                />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Wilgotnosc
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ projectWeather.current.humidity }}%
                  </div>
                </div>
              </div>
              <div class="d-flex align-center gap-2 border rounded pa-3 flex-grow-1">
                <VIcon
                  icon="tabler-wind"
                  size="20"
                  color="info"
                />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Wiatr
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ projectWeather.current.wind }} km/h
                  </div>
                </div>
              </div>
            </div>

            <VDivider class="mb-4" />

            <!-- Forecast -->
            <div class="text-overline text-medium-emphasis mb-3">
              Prognoza
            </div>
            <div class="d-flex justify-space-between">
              <div
                v-for="day in projectWeather.forecast"
                :key="day.day"
                class="text-center"
              >
                <div class="text-caption font-weight-medium text-medium-emphasis mb-1">
                  {{ day.day }}
                </div>
                <VAvatar
                  :color="getWeatherColor(day.icon)"
                  variant="tonal"
                  size="36"
                  rounded
                  class="mb-1"
                >
                  <VIcon
                    :icon="getWeatherIcon(day.icon)"
                    size="20"
                  />
                </VAvatar>
                <div class="text-body-2 font-weight-bold">
                  {{ day.temp }}&deg;
                </div>
              </div>
            </div>
          </VCardText>
          <VCardText
            v-else
            class="flex-grow-1 d-flex align-center justify-center"
          >
            <div class="text-center text-medium-emphasis">
              <VIcon
                icon="tabler-cloud-off"
                size="48"
                class="mb-2 d-block mx-auto"
              />
              Brak danych pogodowych
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 3: Details Grid -->
    <VRow class="mb-6">
      <!-- Inspector Card -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center pa-5 bg-light-info">
            <VAvatar
              color="info"
              variant="tonal"
              rounded
              class="me-3"
            >
              <VIcon icon="tabler-shield-check" />
            </VAvatar>
            <div>
              <h6 class="text-h6">
                Inzynier Kontraktu
              </h6>
              <span class="text-body-2 text-medium-emphasis">
                {{ order.inspector?.full_name || 'Nie przypisano' }}
              </span>
            </div>
          </VCardTitle>
          <VDivider />
          <VCardText
            v-if="hasInspector"
            class="pa-5"
          >
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Status IK
                </div>
                <VChip
                  :color="getIStatusColor(order.i_status)"
                  variant="tonal"
                  label
                >
                  {{ getIStatusLabel(order.i_status) }}
                </VChip>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Data przekazania
                </div>
                <span class="text-body-1">{{ order.i_called || '-' }}</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Data inspekcji
                </div>
                <span class="text-body-1">{{ order.inspected_at || '-' }}</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Uwagi IK
                </div>
                <span class="text-body-1">{{ order.i_notes || '-' }}</span>
              </div>
            </div>
          </VCardText>
          <VCardText
            v-else
            class="pa-5 text-center text-medium-emphasis"
          >
            <VIcon
              icon="tabler-user-off"
              size="36"
              class="mb-2 d-block mx-auto"
            />
            Brak przypisanego inspektora
          </VCardText>
        </VCard>
      </VCol>

      <!-- Surveyor Card -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center pa-5 bg-light-success">
            <VAvatar
              color="success"
              variant="tonal"
              rounded
              class="me-3"
            >
              <VIcon icon="tabler-map-pin" />
            </VAvatar>
            <div>
              <h6 class="text-h6">
                Geodeta
              </h6>
              <span class="text-body-2 text-medium-emphasis">
                {{ order.surveyor?.full_name || 'Nie przypisano' }}
              </span>
            </div>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-5">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Status zlecenia
                </div>
                <StatusBadge :status="order.status" />
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Data wykonania
                </div>
                <span
                  v-if="order.execute_date"
                  class="text-success font-weight-medium"
                >{{ order.execute_date }}</span>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Nr operatu
                </div>
                <span
                  v-if="order.survey_no"
                  class="text-success font-weight-medium"
                >{{ order.survey_no }}</span>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Uwagi geodety
                </div>
                <span class="text-body-1">{{ order.surveyor_notes || '-' }}</span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Technical Details Card -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100">
          <VCardTitle class="d-flex align-center pa-5 bg-light-warning">
            <VAvatar
              color="warning"
              variant="tonal"
              rounded
              class="me-3"
            >
              <VIcon icon="tabler-settings" />
            </VAvatar>
            <div>
              <h6 class="text-h6">
                Szczegoly techniczne
              </h6>
              <span class="text-body-2 text-medium-emphasis">Dane dodatkowe</span>
            </div>
          </VCardTitle>
          <VDivider />
          <VCardText class="pa-5">
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Firma
                </div>
                <span class="text-body-1">{{ order.company || '-' }}</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Dodatkowy kontakt
                </div>
                <span class="text-body-1">{{ order.extra_contact || '-' }}</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Nr rysunku
                </div>
                <span class="text-body-1">{{ order.dwg_no || '-' }}</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Termin realizacji
                </div>
                <VChip
                  v-if="order.completion_date"
                  color="info"
                  variant="tonal"
                  label
                  size="small"
                >
                  {{ order.completion_date }}
                </VChip>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>
              <div>
                <div class="text-overline text-medium-emphasis mb-1">
                  Nr operatu
                </div>
                <span
                  v-if="order.survey_no"
                  class="text-success font-weight-medium"
                >{{ order.survey_no }}</span>
                <span
                  v-else
                  class="text-disabled"
                >-</span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Files Section -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-5">
        <div class="d-flex align-center">
          <VIcon
            icon="tabler-files"
            class="me-2"
          />
          Pliki ({{ order.orderMedia?.length || 0 }})
        </div>
        <VBtn
          color="primary"
          size="small"
          prepend-icon="tabler-plus"
          @click="addFileDialog = true"
        >
          Dodaj
        </VBtn>
      </VCardTitle>
      <VDivider />

      <VDataTable
        v-if="order.orderMedia && order.orderMedia.length > 0"
        :headers="fileHeaders"
        :items="order.orderMedia"
        item-value="id"
        density="compact"
        class="text-no-wrap"
      >
        <!-- File Name -->
        <template #item.file_name="{ item }">
          <a
            :href="item.file_url"
            class="text-decoration-none d-flex align-center gap-2"
          >
            <VIcon
              icon="tabler-file"
              size="18"
              color="primary"
            />
            {{ item.file_name }}
          </a>
        </template>

        <!-- Created At -->
        <template #item.created_at="{ item }">
          {{ item.created_at }}
        </template>

        <!-- User -->
        <template #item.user="{ item }">
          {{ item.user.full_name }}
        </template>

        <!-- Inspector Status -->
        <template #item.i_status="{ item }">
          <VChip
            v-if="item.i_status"
            :color="getIStatusColor(item.i_status)"
            variant="tonal"
            label
            size="small"
          >
            {{ getIStatusLabel(item.i_status) }}
          </VChip>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Visible Toggle -->
        <template #item.i_visible="{ item }">
          <VSwitch
            :model-value="item.i_visible"
            color="primary"
            hide-details
            density="compact"
          />
        </template>
      </VDataTable>

      <VCardText
        v-else
        class="text-center text-medium-emphasis py-8"
      >
        <VIcon
          icon="tabler-files-off"
          size="48"
          class="mb-3 d-block mx-auto"
        />
        Brak plikow w tym zleceniu
      </VCardText>
    </VCard>

    <!-- Add File Dialog -->
    <VDialog
      v-model="addFileDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center pa-5">
          <VIcon
            icon="tabler-upload"
            class="me-2"
          />
          Dodaj plik
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <VFileInput
            label="Wybierz plik"
            prepend-icon="tabler-paperclip"
            variant="outlined"
          />
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="tonal"
            color="secondary"
            @click="addFileDialog = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="primary"
            @click="addFileDialog = false"
          >
            Dodaj
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>

  <!-- Order Not Found -->
  <div v-else>
    <VCard class="text-center pa-12">
      <VIcon
        icon="tabler-file-off"
        size="64"
        color="error"
        class="mb-4"
      />
      <h4 class="text-h4 mb-2">
        Zlecenie nie znalezione
      </h4>
      <p class="text-body-1 text-medium-emphasis mb-4">
        Zlecenie o podanym identyfikatorze nie istnieje.
      </p>
      <VBtn
        color="primary"
        prepend-icon="tabler-arrow-left"
        @click="goBack"
      >
        Powrot do listy
      </VBtn>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.order-map-container {
  block-size: 400px;
  inline-size: 100%;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
