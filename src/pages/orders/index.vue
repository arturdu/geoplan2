<script lang="ts" setup>
import { asgroups, contractors, orders, projects, trades, types, users } from '@/data/mock'
import {
  inspectorStatusColors,
  inspectorStatusLabels,
  orderStatusColors,
  orderStatusLabels,
} from '@/types'
import type { InspectorStatus, Order, OrderStatus } from '@/types'

// ── Add Order Dialog ───────────────────────────────────────
const addOrderDialog = ref(false)
const newOrder = ref({
  project_id: null as number | null,
  trade_id: null as number | null,
  type_id: null as number | null,
  asgroup_ids: [] as number[],
  location: '',
  kms: '',
  dwg_no: '',
  completion_date: '',
  description: '',
  company: '',
  notes: '',
})

const filteredAsgroupOptions = computed(() => {
  if (!newOrder.value.project_id)
    return []

  return asgroups
    .filter(a => a.project_id === newOrder.value.project_id)
    .map(a => ({ title: a.name, value: a.id }))
})

watch(() => newOrder.value.project_id, () => {
  newOrder.value.asgroup_ids = []
})

const openAddDialog = () => {
  newOrder.value = {
    project_id: null,
    trade_id: null,
    type_id: null,
    asgroup_ids: [],
    location: '',
    kms: '',
    dwg_no: '',
    completion_date: '',
    description: '',
    company: '',
    notes: '',
  }
  addOrderDialog.value = true
}

const saveNewOrder = () => {
  // In real app, save to backend
  console.log('Saving new order:', newOrder.value)
  addOrderDialog.value = false
}

// ── Column Definitions ─────────────────────────────────
const allColumns = [
  { title: 'Nr zlecenia', key: 'order_no', width: '130px' },
  { title: 'IK', key: 'i_status', sortable: false, width: '50px' },
  { title: 'Wykonawca', key: 'contractor.name', sortable: false },
  { title: 'Status', key: 'status', sortable: false, width: '130px' },
  { title: 'Data utworzenia', key: 'created_at', sortable: true, width: '140px' },
  { title: 'Projekt', key: 'project.name', sortable: false },
  { title: 'Termin', key: 'completion_date', sortable: true, width: '130px' },
  { title: 'Rodzaj', key: 'type.name', sortable: false },
  { title: 'Branza', key: 'trade.name', sortable: false },
  { title: 'Asortymenty', key: 'asgroups', sortable: false },
  { title: 'Lokalizacja', key: 'location', width: '240px', sortable: false },
  { title: 'Nr rysunku', key: 'dwg_no', sortable: false },
  { title: 'Opis', key: 'description', sortable: false },
  { title: 'Osoba zlecajaca', key: 'contractor_user', width: '200px', sortable: false },
  { title: 'Inspektor', key: 'inspector', sortable: false },
  { title: 'Geodeta', key: 'surveyor', sortable: false },
  { title: 'Data wykonania', key: 'execute_date', sortable: true, width: '140px' },
  { title: 'Nr operatu', key: 'survey_no', width: '120px', sortable: false },
  { title: 'Uwagi', key: 'notes', sortable: false },
  { title: 'Uwagi geodety', key: 'surveyor_notes', sortable: false },
  { title: 'Pliki', key: 'orderMedia', sortable: false, width: '80px' },
]

// ── Tab System ─────────────────────────────────────────
const currentTab = ref(0)

const tabDefinitions = [
  {
    label: 'Podstawowe',
    icon: 'tabler-clipboard-list',
    keys: ['order_no', 'i_status', 'contractor.name', 'status', 'created_at', 'project.name', 'completion_date'],
  },
  {
    label: 'Specyfikacja',
    icon: 'tabler-list-details',
    keys: ['order_no', 'i_status', 'type.name', 'trade.name', 'asgroups', 'location', 'dwg_no', 'description'],
  },
  {
    label: 'Wykonanie',
    icon: 'tabler-tool',
    keys: ['order_no', 'i_status', 'contractor_user', 'inspector', 'surveyor', 'execute_date', 'survey_no'],
  },
  {
    label: 'Dokumentacja',
    icon: 'tabler-file-text',
    keys: ['order_no', 'i_status', 'notes', 'surveyor_notes', 'orderMedia'],
  },
]

const visibleHeaders = computed(() => {
  const activeKeys = tabDefinitions[currentTab.value].keys
  return allColumns.filter(c => activeKeys.includes(c.key))
})

// ── Search & Pagination ────────────────────────────────
const searchQuery = ref('')
const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, val => {
  if (searchTimeout)
    clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
    page.value = 1
  }, 850)
})

const page = ref(1)
const itemsPerPage = ref(25)
const sortBy = ref<string>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const selectedOrders = ref<number[]>([])

// ── Filters ────────────────────────────────────────────
const filtersExpanded = ref(false)
const filterProjectIds = ref<number[]>([])
const filterTradeIds = ref<number[]>([])
const filterTypeIds = ref<number[]>([])
const filterStatuses = ref<OrderStatus[]>([])
const filterIStatuses = ref<string[]>([])
const filterContractorIds = ref<number[]>([])
const filterSurveyorIds = ref<number[]>([])
const filterDateFrom = ref('')
const filterDateTo = ref('')

const statusOptions = Object.entries(orderStatusLabels).map(([value, label]) => ({ title: label, value }))
const iStatusOptions = Object.entries(inspectorStatusLabels).map(([value, label]) => ({ title: label, value }))
const projectOptions = projects.map(p => ({ title: p.name, value: p.id }))
const tradeOptions = trades.map(t => ({ title: t.name, value: t.id }))
const typeOptions = types.map(t => ({ title: t.name, value: t.id }))
const contractorOptions = contractors.map(c => ({ title: c.name, value: c.id }))
const surveyorOptions = users.filter(u => u.type === 'surveyor').map(u => ({ title: u.full_name, value: u.id }))

const toggleStatus = (status: OrderStatus) => {
  const index = filterStatuses.value.indexOf(status)
  if (index > -1) {
    filterStatuses.value.splice(index, 1)
  }
  else {
    filterStatuses.value.push(status)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filterProjectIds.value = []
  filterTradeIds.value = []
  filterTypeIds.value = []
  filterStatuses.value = []
  filterIStatuses.value = []
  filterContractorIds.value = []
  filterSurveyorIds.value = []
  filterDateFrom.value = ''
  filterDateTo.value = ''
}

const hasActiveFilters = computed(() =>
  searchQuery.value !== ''
  || filterProjectIds.value.length > 0
  || filterTradeIds.value.length > 0
  || filterTypeIds.value.length > 0
  || filterStatuses.value.length > 0
  || filterIStatuses.value.length > 0
  || filterContractorIds.value.length > 0
  || filterSurveyorIds.value.length > 0
  || filterDateFrom.value !== ''
  || filterDateTo.value !== '',
)

// ── Data Processing ────────────────────────────────────
const filteredOrders = computed(() => {
  let result = [...orders]

  // Text search
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    result = result.filter(o =>
      o.order_no.toLowerCase().includes(q)
      || o.location.toLowerCase().includes(q)
      || o.description.toLowerCase().includes(q)
      || o.contractor?.name.toLowerCase().includes(q)
      || o.project?.name.toLowerCase().includes(q)
      || o.dwg_no.toLowerCase().includes(q)
      || o.notes.toLowerCase().includes(q)
      || o.surveyor?.full_name.toLowerCase().includes(q)
      || o.contractor_user?.full_name.toLowerCase().includes(q),
    )
  }

  // Filters
  if (filterProjectIds.value.length > 0)
    result = result.filter(o => filterProjectIds.value.includes(o.project_id))

  if (filterTradeIds.value.length > 0)
    result = result.filter(o => filterTradeIds.value.includes(o.trade_id))

  if (filterTypeIds.value.length > 0)
    result = result.filter(o => filterTypeIds.value.includes(o.type_id))

  if (filterStatuses.value.length > 0)
    result = result.filter(o => filterStatuses.value.includes(o.status))

  if (filterIStatuses.value.length > 0) {
    result = result.filter(o => {
      if (o.i_status === null)
        return filterIStatuses.value.includes('null')

      return filterIStatuses.value.includes(o.i_status)
    })
  }

  if (filterContractorIds.value.length > 0)
    result = result.filter(o => filterContractorIds.value.includes(o.contractor_id))

  if (filterSurveyorIds.value.length > 0)
    result = result.filter(o => o.surveyor_id && filterSurveyorIds.value.includes(o.surveyor_id))

  if (filterDateFrom.value)
    result = result.filter(o => o.created_at >= filterDateFrom.value)

  if (filterDateTo.value)
    result = result.filter(o => o.created_at <= filterDateTo.value)

  // Sorting
  if (sortBy.value) {
    result.sort((a, b) => {
      const aVal = (a as any)[sortBy.value] || ''
      const bVal = (b as any)[sortBy.value] || ''
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0

      return sortOrder.value === 'desc' ? -cmp : cmp
    })
  }

  return result
})

const totalItems = computed(() => filteredOrders.value.length)

const paginatedOrders = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  return filteredOrders.value.slice(start, end)
})

const updateOptions = (options: any) => {
  if (options.sortBy && options.sortBy.length > 0) {
    sortBy.value = options.sortBy[0].key
    sortOrder.value = options.sortBy[0].order
  }

  page.value = options.page
  itemsPerPage.value = options.itemsPerPage
}

// ── Row Styling ────────────────────────────────────────
const getRowProps = ({ item }: { item: Order }) => {
  return { class: `order-row--${item.status}` }
}

// ── Helpers ────────────────────────────────────────────
const truncate = (text: string | null | undefined, max: number) => {
  if (!text)
    return ''
  if (text.length <= max)
    return text

  return `${text.substring(0, max)}...`
}

const getIStatusColor = (status: InspectorStatus) => {
  if (!status)
    return 'grey'

  return inspectorStatusColors[status] || 'grey'
}

const getIStatusLabel = (status: InspectorStatus) => {
  if (!status)
    return 'Brak'

  return inspectorStatusLabels[status] || status
}

const exportToExcel = () => {
  alert('Eksport do Excel - funkcja zostanie wdrozona wkrotce.')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <div class="d-flex align-center gap-2 mb-1">
          <VIcon
            icon="tabler-clipboard-list"
            size="28"
            color="primary"
          />
          <h4 class="text-h4">
            Zlecenia
          </h4>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Lista wszystkich zlecen w systemie
        </p>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          prepend-icon="tabler-download"
          @click="exportToExcel"
        >
          Eksport Excel
        </VBtn>
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openAddDialog"
        >
          Nowe zlecenie
        </VBtn>
      </div>
    </div>

    <!-- Filters Panel - Compact Inline -->
    <VCard class="mb-6 filters-panel">
      <VCardText class="pa-5">
        <div class="d-flex align-center gap-3 flex-wrap">
          <!-- Search -->
          <AppTextField
            v-model="searchQuery"
            placeholder="Szukaj zlecenia..."
            prepend-inner-icon="tabler-search"
            clearable
            style="min-inline-size: 320px;"
          />

          <!-- Status Buttons -->
          <div class="d-flex gap-2">
            <VBtn
              v-for="status in statusOptions"
              :key="status.value"
              :variant="filterStatuses.includes(status.value as OrderStatus) ? 'flat' : 'outlined'"
              :color="filterStatuses.includes(status.value as OrderStatus) ? 'primary' : 'default'"
              size="default"
              @click="toggleStatus(status.value as OrderStatus)"
            >
              {{ status.title }}
            </VBtn>
          </div>

          <!-- Project Filter -->
          <AppAutocomplete
            v-model="filterProjectIds"
            :items="projectOptions"
            placeholder="Projekt"
            prepend-inner-icon="tabler-briefcase"
            multiple
            clearable
            chips
            closable-chips
            hide-details
            style="min-inline-size: 200px;"
          />

          <VSpacer />

          <!-- Clear & Expand Buttons -->
          <VBtn
            variant="text"
            size="small"
            color="error"
            prepend-icon="tabler-filter-off"
            :disabled="!hasActiveFilters"
            @click="clearFilters"
          >
            Wyczysc
          </VBtn>

          <VBtn
            variant="tonal"
            size="small"
            color="primary"
            :icon="filtersExpanded ? 'tabler-chevron-up' : 'tabler-chevron-down'"
            @click="filtersExpanded = !filtersExpanded"
          />
        </div>

        <!-- Expandable Additional Filters -->
        <VExpandTransition>
          <div v-show="filtersExpanded">
            <VDivider class="my-4" />
            <VRow>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <AppAutocomplete
                  v-model="filterTradeIds"
                  :items="tradeOptions"
                  label="Branza"
                  prepend-inner-icon="tabler-road"
                  multiple
                  clearable
                  chips
                  closable-chips
                  density="compact"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <AppAutocomplete
                  v-model="filterTypeIds"
                  :items="typeOptions"
                  label="Rodzaj"
                  prepend-inner-icon="tabler-category"
                  multiple
                  clearable
                  chips
                  closable-chips
                  density="compact"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <AppSelect
                  v-model="filterIStatuses"
                  :items="iStatusOptions"
                  label="Status IK"
                  prepend-inner-icon="tabler-shield-check"
                  multiple
                  clearable
                  chips
                  closable-chips
                  density="compact"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <AppAutocomplete
                  v-model="filterContractorIds"
                  :items="contractorOptions"
                  label="Wykonawca"
                  prepend-inner-icon="tabler-building"
                  multiple
                  clearable
                  chips
                  closable-chips
                  density="compact"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <AppAutocomplete
                  v-model="filterSurveyorIds"
                  :items="surveyorOptions"
                  label="Geodeta"
                  prepend-inner-icon="tabler-user"
                  multiple
                  clearable
                  chips
                  closable-chips
                  density="compact"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="3"
              >
                <VRow dense>
                  <VCol cols="6">
                    <AppTextField
                      v-model="filterDateFrom"
                      label="Data od"
                      prepend-inner-icon="tabler-calendar"
                      type="date"
                      density="compact"
                      clearable
                    />
                  </VCol>
                  <VCol cols="6">
                    <AppTextField
                      v-model="filterDateTo"
                      label="Data do"
                      prepend-inner-icon="tabler-calendar"
                      type="date"
                      density="compact"
                      clearable
                    />
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </div>
        </VExpandTransition>
      </VCardText>
    </VCard>

    <!-- Orders Table -->
    <VCard>
      <VCardText
        v-if="selectedOrders.length > 0"
        class="d-flex align-center pa-4"
      >
        <VChip
          color="primary"
          size="small"
          variant="tonal"
        >
          <VIcon
            icon="tabler-checkbox"
            size="16"
            class="me-1"
          />
          {{ selectedOrders.length }} zaznaczonych
        </VChip>
      </VCardText>

      <VDivider v-if="selectedOrders.length > 0" />

      <!-- Tabs - Simple Compact Style -->
      <VTabs
        v-model="currentTab"
        color="primary"
      >
        <VTab
          v-for="(tab, index) in tabDefinitions"
          :key="index"
          :value="index"
        >
          <VIcon
            :icon="tab.icon"
            size="18"
            class="me-2"
          />
          {{ tab.label }}
        </VTab>
      </VTabs>

      <VDivider />

      <VDataTableServer
        v-model="selectedOrders"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="visibleHeaders"
        :items="paginatedOrders"
        :items-length="totalItems"
        :items-per-page-options="[10, 25, 50, 100]"
        item-value="id"
        show-select
        class="text-no-wrap orders-table"
        density="comfortable"
        :sort-by="[{ key: sortBy, order: sortOrder }]"
        :row-props="getRowProps"
        @update:options="updateOptions"
      >
        <!-- Inspector Status -->
        <template #item.i_status="{ item }">
          <VTooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <VIcon
                v-bind="tooltipProps"
                :icon="item.i_status === 'approved' || item.i_status === 'approved_conditionally' || item.i_status === 'rejected' ? 'tabler-shield-check-filled' : 'tabler-shield-check'"
                :color="getIStatusColor(item.i_status)"
                size="20"
              />
            </template>
            {{ getIStatusLabel(item.i_status) }}
          </VTooltip>
        </template>

        <!-- Order No -->
        <template #item.order_no="{ item }">
          <RouterLink
            :to="{ path: `/orders/${item.id}` }"
            class="text-decoration-none"
          >
            <VChip
              color="primary"
              size="small"
              variant="tonal"
              label
              class="font-weight-bold cursor-pointer"
            >
              {{ item.order_no }}
            </VChip>
          </RouterLink>
        </template>

        <!-- Contractor -->
        <template #item.contractor.name="{ item }">
          <VTooltip
            v-if="item.contractor?.name"
            location="top"
          >
            <template #activator="{ props: tooltipProps }">
              <span
                v-bind="tooltipProps"
                class="text-body-2 text-no-wrap"
              >{{ item.contractor.short }}</span>
            </template>
            {{ item.contractor.name }}
          </VTooltip>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <StatusBadge :status="item.status" />
        </template>

        <!-- Created At -->
        <template #item.created_at="{ item }">
          {{ item.created_at }}
        </template>

        <!-- Project -->
        <template #item.project.name="{ item }">
          <VTooltip
            v-if="item.project?.name"
            location="top"
          >
            <template #activator="{ props: tooltipProps }">
              <span
                v-bind="tooltipProps"
                class="text-body-2 text-no-wrap"
              >{{ truncate(item.project.name, 20) }}</span>
            </template>
            {{ item.project.name }}
          </VTooltip>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Type -->
        <template #item.type.name="{ item }">
          <span class="d-inline-flex align-center gap-1" style="max-inline-size: 120px;">
            <VIcon
              v-if="item.type?.icon"
              :icon="item.type.icon"
              size="16"
            />
            {{ item.type?.name }}
          </span>
        </template>

        <!-- Trade -->
        <template #item.trade.name="{ item }">
          <span class="d-inline-flex align-center gap-1" style="max-inline-size: 120px;">
            <VIcon
              v-if="item.trade?.icon"
              :icon="item.trade.icon"
              size="16"
            />
            {{ item.trade?.name }}
          </span>
        </template>

        <!-- Asgroups -->
        <template #item.asgroups="{ item }">
          <ul
            v-if="item.asgroups && item.asgroups.length > 0"
            class="ps-4 mb-0"
            style="list-style-type: disc;"
          >
            <li
              v-for="ag in item.asgroups"
              :key="ag.id"
              class="text-body-2"
            >
              {{ ag.name }}
            </li>
          </ul>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Location -->
        <template #item.location="{ item }">
          <div style="min-width: 200px;">
            <div class="d-flex align-center gap-1 mb-1">
              <VIcon icon="tabler-map-pin" size="16" color="primary" class="flex-shrink-0" />
              <span class="text-body-2 font-weight-medium">{{ item.location }}</span>
            </div>
            <div class="text-caption text-medium-emphasis ps-5">
              {{ item.kms ? `km ${item.kms}` : 'Brak danych' }}
            </div>
          </div>
        </template>

        <!-- Dwg No -->
        <template #item.dwg_no="{ item }">
          <VTooltip
            v-if="item.dwg_no && item.dwg_no.length > 50"
            location="top"
          >
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps">{{ truncate(item.dwg_no, 50) }}</span>
            </template>
            {{ item.dwg_no }}
          </VTooltip>
          <span v-else>{{ item.dwg_no || '-' }}</span>
        </template>

        <!-- Description -->
        <template #item.description="{ item }">
          <VTooltip
            v-if="item.description && item.description.length > 200"
            location="top"
            max-width="400"
          >
            <template #activator="{ props: tooltipProps }">
              <span
                v-bind="tooltipProps"
                class="text-primary"
              >{{ truncate(item.description, 200) }}</span>
            </template>
            {{ item.description }}
          </VTooltip>
          <span
            v-else
            class="text-primary"
          >{{ item.description || '-' }}</span>
        </template>

        <!-- Notes -->
        <template #item.notes="{ item }">
          <div style="max-inline-size: 200px;">
            <VTooltip
              v-if="item.notes && item.notes.length > 110"
              location="top"
              max-width="400"
            >
              <template #activator="{ props: tooltipProps }">
                <span
                  v-bind="tooltipProps"
                  class="text-warning"
                >{{ truncate(item.notes, 110) }}</span>
              </template>
              {{ item.notes }}
            </VTooltip>
            <span
              v-else
              class="text-warning"
            >{{ item.notes || '-' }}</span>
            <div
              v-if="item.company"
              class="text-caption text-medium-emphasis"
            >
              {{ item.company }}
            </div>
          </div>
        </template>

        <!-- Completion Date -->
        <template #item.completion_date="{ item }">
          <VChip
            v-if="item.completion_date"
            color="info"
            size="small"
            variant="tonal"
            label
          >
            <span class="font-weight-bold">{{ item.completion_date }}</span>
          </VChip>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Contractor User -->
        <template #item.contractor_user="{ item }">
          <VChip
            v-if="item.contractor_user"
            color="info"
            size="small"
            variant="tonal"
            label
            style="max-inline-size: 200px; white-space: normal; block-size: auto;"
          >
            {{ item.contractor_user.full_name }}
          </VChip>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Inspector -->
        <template #item.inspector="{ item }">
          <div>
            <span
              v-if="item.inspector"
              class="text-warning font-weight-medium"
            >{{ item.inspector.full_name }}</span>
            <span
              v-else
              class="text-disabled"
            >-</span>
            <div
              v-if="item.i_notes"
              class="text-caption text-medium-emphasis"
            >
              {{ item.i_notes }}
            </div>
          </div>
        </template>

        <!-- Surveyor -->
        <template #item.surveyor="{ item }">
          <span
            v-if="item.surveyor"
            class="text-success font-weight-medium"
          >{{ item.surveyor.full_name }}</span>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Execute Date -->
        <template #item.execute_date="{ item }">
          <span
            v-if="item.execute_date"
            class="text-success font-weight-medium"
          >{{ item.execute_date }}</span>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Survey No -->
        <template #item.survey_no="{ item }">
          <span
            v-if="item.survey_no"
            class="text-success font-weight-medium"
          >{{ item.survey_no }}</span>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Surveyor Notes -->
        <template #item.surveyor_notes="{ item }">
          <VTooltip
            v-if="item.surveyor_notes && item.surveyor_notes.length > 70"
            location="top"
            max-width="350"
          >
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps">{{ truncate(item.surveyor_notes, 70) }}</span>
            </template>
            {{ item.surveyor_notes }}
          </VTooltip>
          <span v-else>{{ item.surveyor_notes || '-' }}</span>
        </template>

        <!-- Order Media -->
        <template #item.orderMedia="{ item }">
          <div
            v-if="item.orderMedia && item.orderMedia.length > 0"
            class="d-flex align-center gap-1"
          >
            <VIcon
              icon="tabler-paperclip"
              size="16"
            />
            <span class="text-body-2">{{ item.orderMedia.length }}</span>
          </div>
          <span
            v-else
            class="text-disabled"
          >-</span>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-database-off"
              size="48"
              color="disabled"
              class="mb-4"
            />
            <p class="text-h6 text-medium-emphasis mb-1">
              Brak zlecen
            </p>
            <p class="text-body-2 text-disabled mb-0">
              Nie znaleziono zlecen pasujacych do kryteriow wyszukiwania.
            </p>
          </div>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VDivider />
          <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5">
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ paginationMeta({ page: page, itemsPerPage: itemsPerPage }, totalItems) }}
            </p>

            <div class="d-flex align-center gap-3">
              <div class="d-flex align-center gap-2">
                <span class="text-body-2 text-medium-emphasis">Wierszy:</span>
                <AppSelect
                  :model-value="itemsPerPage"
                  :items="[10, 25, 50, 100]"
                  style="inline-size: 90px;"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="(val: number) => { itemsPerPage = val; page = 1 }"
                />
              </div>

              <VPagination
                v-model="page"
                active-color="primary"
                :length="Math.ceil(totalItems / itemsPerPage)"
                :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.ceil(totalItems / itemsPerPage), 5)"
                size="small"
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Add Order Dialog -->
    <VDialog
      v-model="addOrderDialog"
      max-width="800"
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
              icon="tabler-clipboard-plus"
              size="24"
            />
          </VAvatar>
          <div>
            <h5 class="text-h5">
              Nowe Zlecenie
            </h5>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Dodaj nowe zlecenie do systemu
            </p>
          </div>
          <VSpacer />
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="addOrderDialog = false"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5" style="max-height: 600px;">
          <VForm @submit.prevent="saveNewOrder">
            <VRow>
              <!-- Dane Podstawowe -->
              <VCol cols="12">
                <h6 class="text-h6 mb-3">
                  <VIcon
                    icon="tabler-file-text"
                    size="20"
                    class="me-2"
                  />
                  Dane Podstawowe
                </h6>
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="newOrder.project_id"
                  :items="projectOptions"
                  label="Projekt *"
                  placeholder="Wybierz projekt"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="newOrder.trade_id"
                  :items="tradeOptions"
                  label="Branza *"
                  placeholder="Wybierz branze"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="newOrder.type_id"
                  :items="typeOptions"
                  label="Rodzaj *"
                  placeholder="Wybierz rodzaj"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppAutocomplete
                  v-model="newOrder.asgroup_ids"
                  :items="filteredAsgroupOptions"
                  label="Asortymenty"
                  placeholder="Wybierz asortymenty"
                  multiple
                  chips
                  closable-chips
                  clearable
                  :disabled="!newOrder.project_id"
                />
              </VCol>

              <!-- Szczegoly Zlecenia -->
              <VCol cols="12">
                <VDivider class="my-4" />
                <h6 class="text-h6 mb-3">
                  <VIcon
                    icon="tabler-map"
                    size="20"
                    class="me-2"
                  />
                  Szczegoly Zlecenia
                </h6>
              </VCol>
              <VCol
                cols="12"
                sm="8"
              >
                <AppTextField
                  v-model="newOrder.location"
                  label="Lokalizacja *"
                  placeholder="np. km 12+450 - km 12+680, strona lewa"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="newOrder.kms"
                  label="Kilometraz"
                  placeholder="np. 12.450"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="newOrder.dwg_no"
                  label="Nr rysunku *"
                  placeholder="np. RYS-001/WD-5"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="newOrder.completion_date"
                  label="Termin realizacji *"
                  type="date"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="newOrder.description"
                  label="Opis *"
                  placeholder="Opisz zlecenie..."
                  rows="3"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="newOrder.company"
                  label="Firma"
                  placeholder="Nazwa firmy (opcjonalnie)"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="newOrder.notes"
                  label="Uwagi"
                  placeholder="Dodatkowe uwagi..."
                  rows="2"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="addOrderDialog = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="primary"
            @click="saveNewOrder"
          >
            Dodaj
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
.filters-panel {
  .v-btn {
    text-transform: none;
    letter-spacing: 0.01em;
    font-size: 0.875rem;

    &.v-btn--variant-flat {
      color: white !important;
    }
  }
}

.orders-table {
  tr.order-row--pending {
    border-inline-start: 3px solid rgb(var(--v-theme-grey));
  }

  tr.order-row--in_progress {
    border-inline-start: 3px solid rgb(var(--v-theme-info));
  }

  tr.order-row--completed {
    border-inline-start: 3px solid rgb(var(--v-theme-success));
  }

  tr.order-row--postponed {
    border-inline-start: 3px solid rgb(var(--v-theme-warning));
  }

  tr.order-row--continuous {
    border-inline-start: 3px solid rgb(var(--v-theme-secondary));
  }

  tr.order-row--canceled {
    border-inline-start: 3px solid rgb(var(--v-theme-error));
  }

  thead th {
    font-size: 0.8125rem !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em;
    white-space: nowrap;
    padding-block: 12px !important;
    padding-inline: 16px !important;
    background-color: rgba(var(--v-theme-surface), 1) !important;
  }

  tbody tr {
    transition: background-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.04) !important;
    }
  }

  td {
    font-size: 0.8125rem !important;
    padding-block: 12px !important;
    padding-inline: 16px !important;
    vertical-align: middle !important;
  }
}

.filters-panel {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  .v-card-title {
    background-color: rgba(var(--v-theme-surface), 1);
    border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  .v-card-text {
    .v-row > .v-col {
      padding-block: 8px;
    }
  }
}
</style>
