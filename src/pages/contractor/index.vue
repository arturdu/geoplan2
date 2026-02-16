<script lang="ts" setup>
import { activities, contractors, orders, projects } from '@/data/mock'
import { orderStatusColors, orderStatusLabels } from '@/types'
import type { Order, OrderStatus } from '@/types'
import { useTheme } from 'vuetify'

// Current contractor (mock: first contractor)
const currentContractor = contractors[0]

// Orders for current contractor
const contractorOrders = computed(() =>
  orders.filter(o => o.contractor_id === currentContractor.id),
)

// Stats
const orderCount = computed(() => contractorOrders.value.length)
const fileCount = computed(() =>
  contractorOrders.value.reduce((sum, o) => sum + o.orderMedia.length, 0),
)
const activityCount = computed(() =>
  activities.filter(a => a.user.full_name === 'Robert Mazur').length,
)

// Recent orders (last 10)
const recentOrders = computed(() =>
  [...contractorOrders.value]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10),
)

const recentOrderHeaders = [
  { title: 'Nr zlecenia', key: 'order_no', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Projekt', key: 'project', sortable: true },
  { title: 'Lokalizacja', key: 'location', sortable: false },
  { title: 'Data utworzenia', key: 'created_at', sortable: true },
]

// Donut chart - order status distribution
const vuetifyTheme = useTheme()

const statusCounts = computed(() => {
  const counts: Record<string, number> = {}
  const allStatuses: OrderStatus[] = ['pending', 'in_progress', 'completed', 'postponed', 'continuous', 'canceled']
  allStatuses.forEach(s => { counts[s] = 0 })
  contractorOrders.value.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1
  })

  return allStatuses
    .filter(s => counts[s] > 0)
    .map(s => ({ status: s, count: counts[s] }))
})

const donutChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const colorMap: Record<string, string> = {
    pending: '#A8AAAE',
    in_progress: '#00CFE8',
    completed: '#28C76F',
    postponed: '#FF9F43',
    continuous: '#7367F0',
    canceled: '#FF4C51',
  }

  return {
    chart: {
      type: 'donut' as const,
    },
    labels: statusCounts.value.map(s => orderStatusLabels[s.status as OrderStatus]),
    colors: statusCounts.value.map(s => colorMap[s.status] || currentTheme.primary),
    legend: {
      position: 'bottom' as const,
      labels: {
        colors: currentTheme['on-surface'],
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Razem',
              fontSize: '16px',
              color: currentTheme['on-surface'],
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} zlecen`,
      },
    },
  }
})

const donutChartSeries = computed(() =>
  statusCounts.value.map(s => s.count),
)

const getProjectName = (order: Order) => {
  const project = projects.find(p => p.id === order.project_id)

  return project?.name || '-'
}
</script>

<template>
  <div>
    <!-- Stat Cards -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        sm="6"
        md="4"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <h4 class="text-h4 mb-1">
                {{ orderCount }}
              </h4>
              <div class="text-subtitle-1">
                Zlecenia
              </div>
              <div class="text-caption text-success">
                +12% od ost. mies.
              </div>
            </div>
            <VAvatar
              color="warning"
              variant="tonal"
              :size="42"
              rounded
            >
              <VIcon
                icon="tabler-clipboard-list"
                size="26"
              />
            </VAvatar>
          </VCardText>
          <VProgressLinear
            color="warning"
            :model-value="100"
            :height="4"
          />
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="4"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <h4 class="text-h4 mb-1">
                {{ fileCount }}
              </h4>
              <div class="text-subtitle-1">
                Zaladowane Pliki
              </div>
              <div class="text-caption text-info">
                +8% od ost. mies.
              </div>
            </div>
            <VAvatar
              color="info"
              variant="tonal"
              :size="42"
              rounded
            >
              <VIcon
                icon="tabler-file-upload"
                size="26"
              />
            </VAvatar>
          </VCardText>
          <VProgressLinear
            color="info"
            :model-value="100"
            :height="4"
          />
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="4"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <h4 class="text-h4 mb-1">
                {{ activityCount }}
              </h4>
              <div class="text-subtitle-1">
                Aktywnosc
              </div>
              <div class="text-caption text-success">
                +5% od ost. tyg.
              </div>
            </div>
            <VAvatar
              color="success"
              variant="tonal"
              :size="42"
              rounded
            >
              <VIcon
                icon="tabler-activity"
                size="26"
              />
            </VAvatar>
          </VCardText>
          <VProgressLinear
            color="success"
            :model-value="100"
            :height="4"
          />
        </VCard>
      </VCol>
    </VRow>

    <!-- Recent Orders Table + Donut Chart -->
    <VRow>
      <VCol
        cols="12"
        md="8"
      >
        <VCard>
          <VCardTitle class="d-flex align-center pa-5">
            <VIcon
              icon="tabler-list"
              class="me-2"
            />
            Ostatnie zlecenia
          </VCardTitle>
          <VDivider />
          <VDataTable
            :headers="recentOrderHeaders"
            :items="recentOrders"
            :items-per-page="10"
            class="text-no-wrap"
          >
            <template #item.order_no="{ item }">
              <span class="font-weight-medium text-high-emphasis">
                {{ item.order_no }}
              </span>
            </template>

            <template #item.status="{ item }">
              <VChip
                :color="orderStatusColors[item.status]"
                size="small"
                label
              >
                {{ orderStatusLabels[item.status] }}
              </VChip>
            </template>

            <template #item.project="{ item }">
              {{ getProjectName(item) }}
            </template>

            <template #item.location="{ item }">
              <span class="text-truncate d-inline-block" style="max-inline-size: 220px;">
                {{ item.location }}
              </span>
            </template>

            <template #item.created_at="{ item }">
              {{ new Date(item.created_at).toLocaleDateString('pl-PL') }}
            </template>
          </VDataTable>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardTitle class="d-flex align-center pa-5">
            <VIcon
              icon="tabler-chart-donut-3"
              class="me-2"
            />
            Statusy zlecen
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              :options="donutChartOptions"
              :series="donutChartSeries"
              type="donut"
              height="350"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
