<script lang="ts" setup>
import { projects } from '@/data/mock'
import type { Project } from '@/types'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'

// ── Theme ───────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── State ───────────────────────────────────────────────
const search = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const mapContainers = ref<{ [key: number]: HTMLElement | null }>({})
const mapInstances = ref<{ [key: number]: mapboxgl.Map }>({})

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

const defaultItem: Partial<Project> = {
  name: '',
  info: '',
  deadline: '16:00',
  deadline_active: true,
  lon: 0,
  lat: 0,
  open_weather_active: false,
}

const editedItem = ref<Partial<Project>>({ ...defaultItem })

const tableItems = ref<Project[]>([...projects])

// ── Table headers ───────────────────────────────────────
const headers = [
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Deadline', key: 'deadline', sortable: true },
  { title: 'Deadline aktywny', key: 'deadline_active', sortable: true },
  { title: 'Lon', key: 'lon', sortable: false, align: 'center' as const },
  { title: 'Lat', key: 'lat', sortable: false, align: 'center' as const },
  { title: 'Pogoda', key: 'open_weather_active', sortable: false, align: 'center' as const },
  { title: 'Utworzono', key: 'created_at', sortable: true },
  { title: 'Zakonczone', key: 'completed', sortable: true },
  { title: 'Zamkniete', key: 'closed', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false },
]

// ── Methods ─────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  dialogVisible.value = true
}

function openEdit(item: Project) {
  isEditing.value = true
  editedItem.value = { ...item }
  dialogVisible.value = true
}

function saveItem() {
  if (isEditing.value) {
    const idx = tableItems.value.findIndex(p => p.id === editedItem.value.id)
    if (idx !== -1) tableItems.value[idx] = { ...tableItems.value[idx], ...editedItem.value } as Project
  } else {
    const newId = Math.max(...tableItems.value.map(p => p.id)) + 1
    tableItems.value.push({
      ...defaultItem,
      ...editedItem.value,
      id: newId,
      team_id: 1,
      min_date: new Date().toISOString().slice(0, 10),
      orders_count: 0,
      completed: null,
      closed: null,
      created_at: new Date().toISOString().slice(0, 10),
      inspector_ids: [],
    } as Project)
  }
  dialogVisible.value = false
}

function deleteItem(item: Project) {
  tableItems.value = tableItems.value.filter(p => p.id !== item.id)
}

function completeContract(item: Project) {
  const idx = tableItems.value.findIndex(p => p.id === item.id)
  if (idx !== -1) tableItems.value[idx].completed = new Date().toISOString().slice(0, 10)
}

function closeContract(item: Project) {
  const idx = tableItems.value.findIndex(p => p.id === item.id)
  if (idx !== -1) tableItems.value[idx].closed = new Date().toISOString().slice(0, 10)
}

function reactivateContract(item: Project) {
  const idx = tableItems.value.findIndex(p => p.id === item.id)
  if (idx !== -1) {
    tableItems.value[idx].completed = null
    tableItems.value[idx].closed = null
  }
}

function restoreView(item: Project) {
  const idx = tableItems.value.findIndex(p => p.id === item.id)
  if (idx !== -1) {
    tableItems.value[idx].completed = null
  }
}

function rowClass(item: Project) {
  if (item.closed) return 'row-closed'
  if (item.completed) return 'row-completed'
  return ''
}

// Custom filter for search
function customFilter(value: unknown, query: string, item: any) {
  if (!query) return true
  const q = query.toLowerCase()
  const raw = item.raw as Project
  return raw.name.toLowerCase().includes(q) || raw.info.toLowerCase().includes(q)
}

// Computed map style based on theme
const mapStyle = computed(() =>
  vuetifyTheme.current.value.dark
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12'
)

// Initialize map for coordinates tooltip
function initializeMap(projectId: number, lon: number, lat: number) {
  if (!mapContainers.value[projectId]) return
  if (mapInstances.value[projectId]) return

  const map = new mapboxgl.Map({
    container: mapContainers.value[projectId]!,
    style: mapStyle.value,
    center: [lon, lat],
    zoom: 14,
  })

  // Add marker
  const marker = new mapboxgl.Marker()
    .setLngLat([lon, lat])
    .addTo(map)

  mapInstances.value[projectId] = map

  // Watch for theme changes and update map style
  watch(() => vuetifyTheme.current.value.dark, (isDark) => {
    if (map) {
      map.setStyle(isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12'
      )
      // Re-add marker after style change
      map.once('styledata', () => {
        marker.remove()
        new mapboxgl.Marker()
          .setLngLat([lon, lat])
          .addTo(map)
      })
    }
  })
}

function formatCoordinates(lon: number, lat: number) {
  return `${lon.toFixed(4)}, ${lat.toFixed(4)}`
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon
          icon="tabler-bookmark"
          size="24"
          class="me-2"
        />
        <span>Kontrakty</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          label="Szukaj..."
          density="compact"
          variant="outlined"
          hide-details
          class="me-4"
          style="max-width: 300px"
        />
        <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreate">
          Nowy Kontrakt
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="tableItems"
        :search="search"
        :custom-filter="customFilter"
        :items-per-page="25"
        density="compact"
        hover
        :row-props="({ item }: any) => ({ class: rowClass(item) })"
      >
        <!-- Name + info description -->
        <template #item.name="{ item }">
          <div>
            <span class="font-weight-bold">{{ item.name }}</span>
            <div class="text-xs text-medium-emphasis text-truncate" style="max-width: 300px">
              {{ item.info }}
            </div>
          </div>
        </template>

        <!-- Orders count badge -->
        <template #item.orders_count="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.orders_count }}
          </VChip>
        </template>

        <!-- Deadline -->
        <template #item.deadline="{ item }">
          {{ item.deadline }}
        </template>

        <!-- Deadline active -->
        <template #item.deadline_active="{ item }">
          <VIcon
            :icon="item.deadline_active ? 'tabler-check' : 'tabler-x'"
            :color="item.deadline_active ? 'success' : 'error'"
            size="20"
          />
        </template>

        <!-- Longitude -->
        <template #item.lon="{ item }">
          <VMenu open-on-hover @update:model-value="(v) => v && initializeMap(item.id, item.lon, item.lat)">
            <template #activator="{ props }">
              <span v-bind="props" class="cursor-pointer text-primary" style="text-decoration: underline">
                {{ formatCoordinates(item.lon, item.lat).split(',')[0] }}
              </span>
            </template>
            <div class="pa-2 bg-surface" style="width: 200px; height: 150px; border-radius: 4px">
              <div
                :key="`map-${item.id}`"
                :ref="(el) => { if (el) mapContainers[item.id] = el as HTMLElement }"
                style="width: 100%; height: 100%; border-radius: 4px"
              />
            </div>
          </VMenu>
        </template>

        <!-- Latitude -->
        <template #item.lat="{ item }">
          <span class="text-medium-emphasis">{{ formatCoordinates(item.lon, item.lat).split(',')[1] }}</span>
        </template>

        <!-- Weather active -->
        <template #item.open_weather_active="{ item }">
          <VIcon
            :icon="item.open_weather_active ? 'tabler-check' : 'tabler-x'"
            :color="item.open_weather_active ? 'success' : 'error'"
            size="20"
          />
        </template>

        <!-- Completed -->
        <template #item.completed="{ item }">
          <span v-if="item.completed" class="font-weight-bold" style="color: #daa520">
            {{ item.completed }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Closed -->
        <template #item.closed="{ item }">
          <span v-if="item.closed" class="font-weight-bold text-error">
            {{ item.closed }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <VMenu>
            <template #activator="{ props }">
              <VBtn icon="tabler-dots-vertical" variant="text" size="small" v-bind="props" />
            </template>
            <VList density="compact">
              <VListItem @click="openEdit(item)">
                <template #prepend>
                  <VIcon icon="tabler-edit" size="18" class="me-2" />
                </template>
                <VListItemTitle>Edytuj</VListItemTitle>
              </VListItem>
              <VListItem @click="deleteItem(item)">
                <template #prepend>
                  <VIcon icon="tabler-trash" size="18" class="me-2" />
                </template>
                <VListItemTitle>Usun</VListItemTitle>
              </VListItem>
              <VDivider />
              <VListItem @click="completeContract(item)">
                <template #prepend>
                  <VIcon icon="tabler-circle-check" size="18" class="me-2" color="warning" />
                </template>
                <VListItemTitle class="text-warning font-weight-medium">Zakoncz Kontrakt</VListItemTitle>
              </VListItem>
              <VListItem @click="reactivateContract(item)">
                <template #prepend>
                  <VIcon icon="tabler-refresh" size="18" class="me-2" color="success" />
                </template>
                <VListItemTitle class="text-success font-weight-medium">Odblokuj/Reaktywuj</VListItemTitle>
              </VListItem>
              <VListItem @click="closeContract(item)">
                <template #prepend>
                  <VIcon icon="tabler-lock" size="18" class="me-2" color="error" />
                </template>
                <VListItemTitle class="text-error font-weight-medium">Zamknij Kontrakt</VListItemTitle>
              </VListItem>
              <VListItem @click="restoreView(item)">
                <template #prepend>
                  <VIcon icon="tabler-eye" size="18" class="me-2" color="warning" />
                </template>
                <VListItemTitle class="text-warning font-weight-medium">Przywroc Widok</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </template>
      </VDataTable>
    </VCard>

    <!-- Edit/Create Dialog -->
    <VDialog
      v-model="dialogVisible"
      max-width="600"
      scrollable
    >
      <VCard>
        <VCardTitle class="d-flex align-center pa-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="40"
            class="me-3"
          >
            <VIcon
              icon="tabler-briefcase-plus"
              size="24"
            />
          </VAvatar>
          <div>
            <h5 class="text-h5">
              {{ isEditing ? 'Edytuj Kontrakt' : 'Nowy Kontrakt' }}
            </h5>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ isEditing ? 'Zaktualizuj dane kontraktu' : 'Dodaj nowy kontrakt do systemu' }}
            </p>
          </div>
          <VSpacer />
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="dialogVisible = false"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5" style="max-height: 600px;">
          <VForm @submit.prevent="saveItem">
            <VTextField
              v-model="editedItem.name"
              label="Nazwa"
              class="mb-3"
            />

            <VTextarea
              v-model="editedItem.info"
              label="Informacje"
              rows="3"
              class="mb-3"
            />

            <VTextField
              v-model="editedItem.deadline"
              label="Deadline (godzina)"
              type="time"
              class="mb-3"
            />

            <VSwitch
              v-model="editedItem.deadline_active"
              label="Deadline aktywny"
              color="success"
              class="mb-3"
            />

            <VRow>
              <VCol cols="6">
                <VTextField
                  v-model.number="editedItem.lon"
                  label="Dlugosc geogr. (lon)"
                  type="number"
                  step="0.0001"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model.number="editedItem.lat"
                  label="Szerokosc geogr. (lat)"
                  type="number"
                  step="0.0001"
                />
              </VCol>
            </VRow>

            <VSwitch
              v-model="editedItem.open_weather_active"
              label="Pogoda aktywna"
              color="success"
              class="mb-4 mt-3"
            />
          </VForm>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogVisible = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="primary"
            @click="saveItem"
          >
            {{ isEditing ? 'Zapisz' : 'Dodaj' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
:deep(.row-completed) {
  background-color: rgba(218, 165, 32, 0.08) !important;
}
:deep(.row-closed) {
  background-color: rgba(234, 84, 85, 0.08) !important;
}
</style>
