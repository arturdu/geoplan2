<script lang="ts" setup>
import { useTheme } from 'vuetify'
import { orders, posts, users } from '@/data/mock'
import { hexToRgb } from '@layouts/utils'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── Panel 3: Analytics & Reporting ────────────────────

// Row 1: 5 Mini Stats
const ordersThisWeek = computed(() => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return orders.filter(o => {
    const d = new Date(o.created_at)
    return d >= weekAgo && d <= now
  }).length
})

const ordersThisMonth = computed(() => {
  const now = new Date()
  return orders.filter(o => {
    const d = new Date(o.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
})

const completionRate = computed(() => {
  const total = orders.length
  const completed = orders.filter(o => o.status === 'completed').length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const avgTimePerOrder = computed(() => {
  const completedOrders = orders.filter(o => o.status === 'completed' && o.execute_date)
  if (completedOrders.length === 0) return 0

  let totalDays = 0
  completedOrders.forEach(o => {
    const start = new Date(o.created_at)
    const end = new Date(o.execute_date!)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    totalDays += days
  })

  return Math.round(totalDays / completedOrders.length)
})

const teamUtilization = computed(() => {
  const activeSurveyors = users.filter(u => u.type === 'surveyor' && u.is_active).length
  const totalSurveyors = users.filter(u => u.type === 'surveyor').length
  return totalSurveyors > 0 ? Math.round((activeSurveyors / totalSurveyors) * 100) : 0
})

const miniStats = computed(() => [
  {
    title: 'Ten tydzien',
    stats: String(ordersThisWeek.value),
    icon: 'tabler-calendar-week',
    color: 'primary',
    subtitle: 'zlecen',
  },
  {
    title: 'Ten miesiac',
    stats: String(ordersThisMonth.value),
    icon: 'tabler-calendar-month',
    color: 'info',
    subtitle: 'zlecen',
  },
  {
    title: 'Wykonalnosc',
    stats: `${completionRate.value}%`,
    icon: 'tabler-percentage',
    color: 'success',
    subtitle: 'ukonczone',
  },
  {
    title: 'Sredni czas',
    stats: `${avgTimePerOrder.value}d`,
    icon: 'tabler-clock',
    color: 'warning',
    subtitle: 'na zlecenie',
  },
  {
    title: 'Wykorzystanie',
    stats: `${teamUtilization.value}%`,
    icon: 'tabler-users',
    color: 'secondary',
    subtitle: 'zespolu',
  },
])

// ── Monthly Trend Chart ────────────────────────────────
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

const trendChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      type: 'line' as const,
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    stroke: {
      width: [3, 3],
      curve: 'smooth' as const,
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

const trendChartSeries = computed(() => [
  { name: 'Wykonane', data: monthlyCompleted.value },
  { name: 'W toku / Oczekujace', data: monthlyPending.value },
])

// ── Status Distribution Pie Chart ──────────────────────
const statusDistribution = computed(() => {
  const counts = {
    completed: 0,
    in_progress: 0,
    pending: 0,
    continuous: 0,
    postponed: 0,
    canceled: 0,
  }

  orders.forEach(o => {
    counts[o.status]++
  })

  return counts
})

const pieChartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      type: 'donut' as const,
    },
    labels: ['Wykonane', 'W toku', 'Oczekujace', 'Ciagle', 'Odlozone', 'Anulowane'],
    colors: [
      currentTheme.success,
      currentTheme.info,
      currentTheme.warning,
      currentTheme.secondary,
      currentTheme.error,
      'rgba(var(--v-theme-on-surface), 0.2)',
    ],
    legend: {
      position: 'bottom' as const,
      labels: { colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['high-emphasis-opacity']})` },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: { show: true },
            value: { show: true },
            total: {
              show: true,
              label: 'Laczne',
              formatter: () => String(orders.length),
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
  }
})

const pieChartSeries = computed(() => [
  statusDistribution.value.completed,
  statusDistribution.value.in_progress,
  statusDistribution.value.pending,
  statusDistribution.value.continuous,
  statusDistribution.value.postponed,
  statusDistribution.value.canceled,
])

// ── Recent Activity Timeline ───────────────────────────
const recentActivity = computed(() => {
  return [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map(o => ({
      title: o.name,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('pl-PL'),
      time: new Date(o.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    }))
})

const getActivityIcon = (status: string): string => {
  const icons: Record<string, string> = {
    completed: 'tabler-circle-check',
    in_progress: 'tabler-progress',
    pending: 'tabler-clock',
    continuous: 'tabler-refresh',
    postponed: 'tabler-calendar-pause',
    canceled: 'tabler-circle-x',
  }
  return icons[status] || 'tabler-circle'
}

const getActivityColor = (status: string): string => {
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

// ── Top Performers ─────────────────────────────────────
const topPerformers = computed(() => {
  const surveyors = users.filter(u => u.type === 'surveyor')
  return surveyors
    .sort((a, b) => b.orders_count - a.orders_count)
    .slice(0, 6)
    .map((s, idx) => ({
      rank: idx + 1,
      name: s.full_name,
      ordersCount: s.orders_count,
      isActive: s.is_active,
    }))
})

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'warning'
  if (rank === 2) return 'secondary'
  if (rank === 3) return 'error'
  return 'info'
}
</script>

<template>
  <div>
    <!-- Row 1: 5 Mini Stats -->
    <VRow class="mb-6">
      <VCol
        v-for="card in miniStats"
        :key="card.title"
        cols="12"
        sm="6"
        md="2"
      >
        <VCard>
          <VCardText class="pa-3 text-center">
            <VAvatar
              :color="card.color"
              variant="tonal"
              size="40"
              class="mb-2"
            >
              <VIcon
                :icon="card.icon"
                size="22"
              />
            </VAvatar>
            <h5 class="text-h5 font-weight-bold mb-1">
              {{ card.stats }}
            </h5>
            <div class="text-caption font-weight-medium">
              {{ card.title }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ card.subtitle }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 2: Charts -->
    <VRow class="mb-6">
      <!-- Monthly Trend Chart -->
      <VCol
        cols="12"
        md="6"
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
                  icon="tabler-chart-line"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Trend miesieczny</VCardTitle>
            <VCardSubtitle>Zlecenia w 2025 roku</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VueApexCharts
              :options="trendChartOptions"
              :series="trendChartSeries"
              height="320"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Status Distribution Pie Chart -->
      <VCol
        cols="12"
        md="6"
      >
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-chart-donut"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Rozklad statusow</VCardTitle>
            <VCardSubtitle>Podzial wszystkich zlecen</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VueApexCharts
              :options="pieChartOptions"
              :series="pieChartSeries"
              height="320"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 3: Recent Activity Timeline + Top Performers -->
    <VRow>
      <!-- Recent Activity Timeline -->
      <VCol
        cols="12"
        md="6"
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
                  icon="tabler-activity"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Ostatnia aktywnosc</VCardTitle>
            <VCardSubtitle>Najnowsze zlecenia</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VTimeline
              side="end"
              density="compact"
              class="activity-timeline"
            >
              <VTimelineItem
                v-for="activity in recentActivity"
                :key="`${activity.title}-${activity.date}`"
                :dot-color="getActivityColor(activity.status)"
                size="x-small"
              >
                <template #icon>
                  <VIcon
                    :icon="getActivityIcon(activity.status)"
                    size="12"
                  />
                </template>
                <div class="d-flex justify-space-between align-center mb-1">
                  <h6 class="text-subtitle-2 font-weight-medium">
                    {{ activity.title }}
                  </h6>
                  <span class="text-caption text-medium-emphasis">
                    {{ activity.time }}
                  </span>
                </div>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ activity.date }}
                </p>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Top Performers -->
      <VCol
        cols="12"
        md="6"
      >
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-trophy"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Najlepsi geodeci</VCardTitle>
            <VCardSubtitle>Ranking wedlug liczby zlecen</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VList>
              <VListItem
                v-for="performer in topPerformers"
                :key="performer.name"
                class="border-b"
              >
                <template #prepend>
                  <VAvatar
                    :color="getRankColor(performer.rank)"
                    size="40"
                  >
                    <span class="text-h6 font-weight-bold">
                      {{ performer.rank }}
                    </span>
                  </VAvatar>
                </template>
                <VListItemTitle class="font-weight-medium">
                  {{ performer.name }}
                  <VChip
                    v-if="performer.isActive"
                    color="success"
                    size="x-small"
                    class="ms-2"
                  >
                    Aktywny
                  </VChip>
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ performer.ordersCount }} zlecen
                </VListItemSubtitle>
                <template #append>
                  <VProgressCircular
                    :model-value="(performer.ordersCount / topPerformers[0].ordersCount) * 100"
                    :color="getRankColor(performer.rank)"
                    size="40"
                    width="4"
                  >
                    <span class="text-caption">{{ performer.ordersCount }}</span>
                  </VProgressCircular>
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
.activity-timeline {
  max-block-size: 480px;
  overflow-y: auto;
}
</style>
