<script lang="ts" setup>
import { activities, orders, projects, teams, users } from '@/data/mock'
import { orderStatusColors, orderStatusLabels } from '@/types'
import type { OrderStatus } from '@/types'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()

// Overview card stats
const stats = [
  {
    title: 'Zespoly Geodezyjne',
    count: teams.length,
    icon: 'tabler-users-group',
    color: 'primary',
  },
  {
    title: 'Uzytkownicy',
    count: users.length,
    icon: 'tabler-users',
    color: 'info',
  },
  {
    title: 'Kontrakty',
    count: projects.length,
    icon: 'tabler-bookmark',
    color: 'success',
  },
  {
    title: 'Zlecenia',
    count: orders.length,
    icon: 'tabler-clipboard-list',
    color: 'warning',
  },
]

// Activity timeline - recent 15 activities
const recentActivities = activities.slice(0, 15)

const activityIconMap: Record<string, { icon: string; color: string }> = {
  order_created: { icon: 'tabler-plus', color: 'primary' },
  order_updated: { icon: 'tabler-pencil', color: 'info' },
  status_changed: { icon: 'tabler-exchange', color: 'warning' },
  file_uploaded: { icon: 'tabler-file-upload', color: 'success' },
  comment_added: { icon: 'tabler-message', color: 'secondary' },
  user_login: { icon: 'tabler-login', color: 'error' },
}

const formatTimeAgo = (dateStr: string) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 60)
    return `${diffMin} min temu`
  if (diffHours < 24)
    return `${diffHours} godz. temu`

  return `${diffDays} dni temu`
}

// Orders by status bar chart (horizontal)
const allStatuses: OrderStatus[] = ['pending', 'in_progress', 'completed', 'postponed', 'continuous', 'canceled']

const statusCountsForBar = computed(() => {
  const counts: Record<string, number> = {}
  allStatuses.forEach(s => { counts[s] = 0 })
  orders.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1
  })

  return allStatuses.map(s => counts[s])
})

const barChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const statusColorValues = ['#A8AAAE', '#00CFE8', '#28C76F', '#FF9F43', '#7367F0', '#FF4C51']

  return {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '60%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
      },
    },
    colors: statusColorValues,
    legend: { show: false },
    grid: {
      borderColor: `${currentTheme['on-surface']}1A`,
      padding: { top: -10, bottom: -5 },
    },
    xaxis: {
      categories: allStatuses.map(s => orderStatusLabels[s]),
      labels: {
        style: { colors: currentTheme['on-surface'], fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: currentTheme['on-surface'], fontSize: '12px' },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} zlecen`,
      },
    },
  }
})

const barChartSeries = computed(() => [
  { name: 'Zlecenia', data: statusCountsForBar.value },
])

// Users by type donut chart
const userTypeCounts = computed(() => {
  const counts = { surveyor: 0, contractor: 0, inspector: 0 }
  users.forEach(u => {
    counts[u.type] = (counts[u.type] || 0) + 1
  })

  return counts
})

const userTypeLabels: Record<string, string> = {
  surveyor: 'Geodeci',
  contractor: 'Wykonawcy',
  inspector: 'Inspektorzy',
}

const donutChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors

  return {
    chart: {
      type: 'donut' as const,
    },
    labels: ['Geodeci', 'Wykonawcy', 'Inspektorzy'],
    colors: ['#7367F0', '#FF9F43', '#00CFE8'],
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
        formatter: (val: number) => `${val} uzytkownikow`,
      },
    },
  }
})

const donutChartSeries = computed(() => [
  userTypeCounts.value.surveyor,
  userTypeCounts.value.contractor,
  userTypeCounts.value.inspector,
])
</script>

<template>
  <div>
    <!-- Overview Cards -->
    <VRow class="mb-6">
      <VCol
        v-for="stat in stats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <CardStatisticsHorizontal
          :title="stat.title"
          :stats="String(stat.count)"
          :icon="stat.icon"
          :color="stat.color"
        />
      </VCol>
    </VRow>

    <!-- Activity Timeline + Charts -->
    <VRow class="mb-6">
      <!-- Activity Timeline -->
      <VCol
        cols="12"
        md="6"
      >
        <VCard>
          <VCardTitle class="d-flex align-center pa-5">
            <VIcon
              icon="tabler-list-details"
              class="me-2"
            />
            Ostatnia aktywnosc
          </VCardTitle>
          <VCardText style="max-block-size: 500px; overflow-y: auto;">
            <VTimeline
              side="end"
              align="start"
              line-inset="8"
              truncate-line="start"
              density="compact"
            >
              <VTimelineItem
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activityIconMap[activity.type]?.color || 'primary'"
                size="x-small"
              >
                <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-1">
                  <span class="app-timeline-title font-weight-medium">
                    {{ activity.description }}
                  </span>
                  <span class="app-timeline-meta text-caption text-disabled">
                    {{ formatTimeAgo(activity.created_at) }}
                  </span>
                </div>
                <div class="app-timeline-text text-body-2 text-medium-emphasis">
                  {{ activity.user.full_name }}
                </div>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Charts Column -->
      <VCol
        cols="12"
        md="6"
      >
        <!-- Orders by Status Bar Chart -->
        <VCard class="mb-6">
          <VCardTitle class="d-flex align-center pa-5">
            <VIcon
              icon="tabler-chart-bar"
              class="me-2"
            />
            Zlecenia wg statusu
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              :options="barChartOptions"
              :series="barChartSeries"
              type="bar"
              height="300"
            />
          </VCardText>
        </VCard>

        <!-- Users by Type Donut Chart -->
        <VCard>
          <VCardTitle class="d-flex align-center pa-5">
            <VIcon
              icon="tabler-chart-donut-3"
              class="me-2"
            />
            Uzytkownicy wg typu
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              :options="donutChartOptions"
              :series="donutChartSeries"
              type="donut"
              height="300"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
