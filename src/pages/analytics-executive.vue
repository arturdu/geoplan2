<script lang="ts" setup>
import { useTheme } from 'vuetify'
import { orders, projects, users } from '@/data/mock'
import { hexToRgb } from '@layouts/utils'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()

// ── PANEL 3 VARIANT: "Executive Analytics" ────────────
// Focus: Rich data visualization, KPIs, trends, performance metrics

// ── Key Performance Indicators ────────────────────────
const totalRevenue = computed(() => {
  // Mock calculation - in real app would be from actual revenue data
  return 247500
})

const revenueGrowth = computed(() => '+18.3%')

const totalProjects = projects.length
const activeContracts = projects.filter(p => !p.closed && !p.completed).length

const clientSatisfaction = computed(() => 94) // Mock metric

const teamEfficiency = computed(() => {
  const completedOrders = orders.filter(o => o.status === 'completed').length
  return Math.round((completedOrders / orders.length) * 100)
})

// ── Executive KPI Cards ────────────────────────────────
const executiveKPIs = computed(() => [
  {
    title: 'Przychody',
    value: `${(totalRevenue.value / 1000).toFixed(1)}k PLN`,
    subtitle: revenueGrowth.value + ' vs poprzedni miesiąc',
    icon: 'tabler-currency-dollar',
    color: 'success',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    chart: 'area',
    trend: 'up',
  },
  {
    title: 'Aktywne Kontrakty',
    value: activeContracts,
    subtitle: `z ${totalProjects} projektów`,
    icon: 'tabler-file-certificate',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    chart: 'radial',
    progress: Math.round((activeContracts / totalProjects) * 100),
  },
  {
    title: 'Satysfakcja Klientów',
    value: `${clientSatisfaction.value}%`,
    subtitle: 'średnia ocena',
    icon: 'tabler-mood-smile',
    color: 'warning',
    gradient: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)',
    chart: 'gauge',
    score: clientSatisfaction.value,
  },
  {
    title: 'Efektywność Zespołu',
    value: `${teamEfficiency.value}%`,
    subtitle: 'wskaźnik realizacji',
    icon: 'tabler-target-arrow',
    color: 'info',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    chart: 'progress',
    progress: teamEfficiency.value,
  },
])

// ── Monthly Performance Chart ──────────────────────────
const monthLabels = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru']

const monthlyRevenue = computed(() => {
  // Mock data - in real app would be from actual revenue tracking
  return [18.2, 21.5, 24.8, 19.3, 27.4, 31.2, 28.9, 33.5, 29.7, 35.2, 32.8, 38.4]
})

const monthlyOrders = computed(() => {
  const counts = Array(12).fill(0)
  orders.forEach(o => {
    const date = new Date(o.created_at)
    if (date.getFullYear() === 2025)
      counts[date.getMonth()]++
  })
  return counts
})

const performanceChartOptions = computed(() => {
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
      width: [0, 4],
      curve: 'smooth' as const,
    },
    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    colors: [currentTheme.primary, currentTheme.success],
    dataLabels: { enabled: false },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: { colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['high-emphasis-opacity']})` },
      markers: { offsetX: -2 },
      itemMargin: { horizontal: 10 },
    },
    grid: {
      borderColor: `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`,
      padding: { top: -20, bottom: -8, left: 20, right: 20 },
    },
    xaxis: {
      categories: monthLabels,
      labels: {
        style: {
          colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
          fontSize: '13px',
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        labels: {
          style: {
            colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
            fontSize: '13px',
          },
          formatter: (val: number) => `${val}k`,
        },
      },
      {
        opposite: true,
        labels: {
          style: {
            colors: `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`,
            fontSize: '13px',
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      y: [
        { formatter: (val: number) => `${val}k PLN` },
        { formatter: (val: number) => `${val} zleceń` },
      ],
    },
  }
})

const performanceChartSeries = computed(() => [
  { name: 'Przychody (tys. PLN)', type: 'area', data: monthlyRevenue.value },
  { name: 'Liczba Zleceń', type: 'line', data: monthlyOrders.value },
])

// ── Team Performance Leaderboard ───────────────────────
const teamLeaderboard = computed(() => {
  const surveyors = users.filter(u => u.type === 'surveyor')
  return surveyors
    .sort((a, b) => b.orders_count - a.orders_count)
    .slice(0, 8)
    .map((s, idx) => ({
      rank: idx + 1,
      name: s.full_name,
      ordersCount: s.orders_count,
      isActive: s.is_active,
      efficiency: Math.round(70 + Math.random() * 30), // Mock metric
    }))
})

const getRankMedal = (rank: number): string => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'warning'
  if (rank === 2) return 'default'
  if (rank === 3) return 'error'
  return 'info'
}

// ── Project Status Distribution ───────────────────────
const projectStatusDistribution = computed(() => {
  const active = projects.filter(p => !p.closed && !p.completed).length
  const completed = projects.filter(p => p.completed).length
  const closed = projects.filter(p => p.closed).length

  return [
    { label: 'Aktywne', value: active, color: 'success', percentage: Math.round((active / projects.length) * 100) },
    { label: 'Zakończone', value: completed, color: 'primary', percentage: Math.round((completed / projects.length) * 100) },
    { label: 'Zamknięte', value: closed, color: 'secondary', percentage: Math.round((closed / projects.length) * 100) },
  ]
})

// ── Order Status Metrics ───────────────────────────────
const orderMetrics = computed(() => {
  const total = orders.length
  const completed = orders.filter(o => o.status === 'completed').length
  const inProgress = orders.filter(o => o.status === 'in_progress').length
  const pending = orders.filter(o => o.status === 'pending').length
  const overdue = orders.filter(o => {
    if (o.status === 'completed' || o.status === 'canceled') return false
    const completionDate = new Date(o.completion_date)
    return completionDate < new Date()
  }).length

  return [
    {
      title: 'Łącznie Zleceń',
      value: total,
      icon: 'tabler-clipboard-list',
      color: 'primary',
    },
    {
      title: 'Wykonane',
      value: completed,
      percentage: Math.round((completed / total) * 100),
      icon: 'tabler-circle-check',
      color: 'success',
    },
    {
      title: 'W Toku',
      value: inProgress,
      percentage: Math.round((inProgress / total) * 100),
      icon: 'tabler-progress',
      color: 'info',
    },
    {
      title: 'Oczekujące',
      value: pending,
      percentage: Math.round((pending / total) * 100),
      icon: 'tabler-clock',
      color: 'warning',
    },
    {
      title: 'Przeterminowane',
      value: overdue,
      percentage: Math.round((overdue / total) * 100),
      icon: 'tabler-alert-triangle',
      color: 'error',
    },
  ]
})

// ── Completion Rate Gauge ──────────────────────────────
const completionRateGaugeOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors

  return {
    chart: {
      type: 'radialBar',
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '65%',
        },
        track: {
          background: `rgba(${hexToRgb(currentTheme['on-surface'])}, 0.12)`,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 600,
            offsetY: -10,
            color: `rgba(${hexToRgb(currentTheme['on-surface'])}, 0.87)`,
          },
          value: {
            show: true,
            fontSize: '32px',
            fontWeight: 700,
            offsetY: 10,
            color: currentTheme.success,
            formatter: (val: number) => `${val}%`,
          },
        },
      },
    },
    colors: [currentTheme.success],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [currentTheme.primary],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Realizacja'],
  }
})

const completionRateGaugeSeries = computed(() => [teamEfficiency.value])
</script>

<template>
  <div class="executive-dashboard">
    <!-- ROW 1: Executive KPI Cards -->
    <VRow class="mb-6">
      <VCol
        v-for="kpi in executiveKPIs"
        :key="kpi.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="executive-kpi-card h-100">
          <VCardText class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <VAvatar
                size="64"
                :style="{ background: kpi.gradient }"
                rounded
                class="kpi-icon"
              >
                <VIcon
                  :icon="kpi.icon"
                  size="36"
                  color="white"
                />
              </VAvatar>
              <VChip
                v-if="kpi.trend"
                :color="kpi.trend === 'up' ? 'success' : 'error'"
                size="small"
                variant="flat"
              >
                <VIcon
                  :icon="kpi.trend === 'up' ? 'tabler-trending-up' : 'tabler-trending-down'"
                  size="16"
                  start
                />
              </VChip>
            </div>

            <h3 class="text-h3 font-weight-bold mb-2">
              {{ kpi.value }}
            </h3>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ kpi.title }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ kpi.subtitle }}
            </div>

            <template v-if="kpi.chart === 'radial' && kpi.progress">
              <VProgressLinear
                :model-value="kpi.progress"
                :color="kpi.color"
                height="8"
                rounded
                class="mt-4"
              />
            </template>

            <template v-if="kpi.chart === 'progress' && kpi.progress">
              <div class="mt-4">
                <VProgressCircular
                  :model-value="kpi.progress"
                  :color="kpi.color"
                  :size="60"
                  width="6"
                >
                  <span class="text-caption font-weight-bold">{{ kpi.progress }}%</span>
                </VProgressCircular>
              </div>
            </template>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 2: Performance Chart + Completion Gauge -->
    <VRow class="mb-6">
      <!-- Performance Chart -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="h-100">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-chart-line"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Wydajność i Przychody
            </VCardTitle>
            <VCardSubtitle>Porównanie miesięczne 2025</VCardSubtitle>
            <template #append>
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
              >
                Eksportuj
              </VBtn>
            </template>
          </VCardItem>
          <VCardText>
            <VueApexCharts
              :options="performanceChartOptions"
              :series="performanceChartSeries"
              height="360"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Completion Rate Gauge + Stats -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-target"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Wskaźnik Realizacji
            </VCardTitle>
            <VCardSubtitle>Efektywność zespołu</VCardSubtitle>
          </VCardItem>
          <VCardText class="text-center">
            <VueApexCharts
              :options="completionRateGaugeOptions"
              :series="completionRateGaugeSeries"
              height="260"
            />

            <VDivider class="my-4" />

            <VRow dense>
              <VCol
                v-for="metric in orderMetrics.slice(1, 5)"
                :key="metric.title"
                cols="6"
              >
                <div class="text-center pa-2">
                  <VAvatar
                    :color="metric.color"
                    variant="tonal"
                    size="40"
                    class="mb-2"
                  >
                    <VIcon
                      :icon="metric.icon"
                      size="20"
                    />
                  </VAvatar>
                  <h6 class="text-h6 font-weight-bold">
                    {{ metric.value }}
                  </h6>
                  <div class="text-caption text-medium-emphasis">
                    {{ metric.title }}
                  </div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 3: Team Leaderboard + Project Distribution -->
    <VRow class="mb-6">
      <!-- Team Leaderboard -->
      <VCol
        cols="12"
        md="7"
      >
        <VCard class="h-100">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-trophy"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Ranking Wydajności Zespołu
            </VCardTitle>
            <VCardSubtitle>Top geodeci według liczby zleceń</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VTable class="leaderboard-table">
              <thead>
                <tr>
                  <th class="text-center">
                    Pozycja
                  </th>
                  <th>Geodeta</th>
                  <th class="text-center">
                    Zlecenia
                  </th>
                  <th class="text-center">
                    Efektywność
                  </th>
                  <th class="text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="member in teamLeaderboard"
                  :key="member.name"
                  class="leaderboard-row"
                >
                  <td class="text-center">
                    <VChip
                      :color="getRankColor(member.rank)"
                      size="small"
                      class="font-weight-bold"
                    >
                      {{ getRankMedal(member.rank) }}
                    </VChip>
                  </td>
                  <td>
                    <div class="d-flex align-center gap-3">
                      <VAvatar
                        color="primary"
                        variant="tonal"
                        size="40"
                      >
                        <VIcon
                          icon="tabler-user"
                          size="20"
                        />
                      </VAvatar>
                      <div>
                        <div class="font-weight-bold">
                          {{ member.name }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="font-weight-bold text-h6">
                      {{ member.ordersCount }}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column align-center gap-1">
                      <VProgressLinear
                        :model-value="member.efficiency"
                        :color="getRankColor(member.rank)"
                        height="8"
                        rounded
                        class="efficiency-bar"
                      />
                      <span class="text-caption">{{ member.efficiency }}%</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <VChip
                      :color="member.isActive ? 'success' : 'default'"
                      size="small"
                      variant="tonal"
                    >
                      {{ member.isActive ? 'Aktywny' : 'Nieaktywny' }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Project Distribution -->
      <VCol
        cols="12"
        md="5"
      >
        <VCard class="h-100">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-chart-donut"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Status Projektów
            </VCardTitle>
            <VCardSubtitle>Rozkład wszystkich projektów</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <div class="project-distribution">
              <div
                v-for="status in projectStatusDistribution"
                :key="status.label"
                class="distribution-item"
              >
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="status.color"
                      variant="tonal"
                      size="48"
                    >
                      <span class="text-h6 font-weight-bold">{{ status.value }}</span>
                    </VAvatar>
                    <div>
                      <div class="text-body-1 font-weight-medium">
                        {{ status.label }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ status.percentage }}% wszystkich
                      </div>
                    </div>
                  </div>
                </div>
                <VProgressLinear
                  :model-value="status.percentage"
                  :color="status.color"
                  height="12"
                  rounded
                  class="mb-4"
                >
                  <template #default="{ value }">
                    <span class="text-caption font-weight-bold text-white">
                      {{ Math.ceil(value) }}%
                    </span>
                  </template>
                </VProgressLinear>
              </div>

              <VDivider class="my-4" />

              <div class="summary-stats">
                <VRow dense>
                  <VCol
                    cols="6"
                    class="text-center"
                  >
                    <h4 class="text-h4 font-weight-bold text-primary">
                      {{ projects.length }}
                    </h4>
                    <div class="text-caption text-medium-emphasis">
                      Łącznie Projektów
                    </div>
                  </VCol>
                  <VCol
                    cols="6"
                    class="text-center"
                  >
                    <h4 class="text-h4 font-weight-bold text-success">
                      {{ activeContracts }}
                    </h4>
                    <div class="text-caption text-medium-emphasis">
                      Aktywne Teraz
                    </div>
                  </VCol>
                </VRow>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 4: Order Metrics Summary -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="secondary"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-clipboard-data"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Podsumowanie Zleceń
            </VCardTitle>
            <VCardSubtitle>Szczegółowa analiza statusów</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VRow>
              <VCol
                v-for="metric in orderMetrics"
                :key="metric.title"
                cols="12"
                sm="6"
                md="auto"
                class="flex-grow-1"
              >
                <div class="metric-card pa-4 rounded-lg">
                  <div class="d-flex align-center gap-3 mb-3">
                    <VAvatar
                      :color="metric.color"
                      variant="flat"
                      size="56"
                    >
                      <VIcon
                        :icon="metric.icon"
                        size="30"
                      />
                    </VAvatar>
                    <div>
                      <h4 class="text-h4 font-weight-bold">
                        {{ metric.value }}
                      </h4>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ metric.title }}
                      </div>
                    </div>
                  </div>
                  <VProgressLinear
                    v-if="metric.percentage !== undefined"
                    :model-value="metric.percentage"
                    :color="metric.color"
                    height="6"
                    rounded
                  />
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.executive-dashboard {
  // Executive KPI Cards
  .executive-kpi-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);

      .kpi-icon {
        transform: scale(1.1) rotate(-5deg);
      }
    }

    .kpi-icon {
      transition: transform 0.4s ease;
    }
  }

  // Leaderboard Table
  .leaderboard-table {
    .leaderboard-row {
      transition: all 0.2s ease;

      &:hover {
        background: rgba(var(--v-theme-on-surface), 0.04);
      }
    }

    .efficiency-bar {
      inline-size: 100px;
    }
  }

  // Project Distribution
  .project-distribution {
    .distribution-item {
      margin-block-end: 8px;
    }
  }

  // Metric Cards
  .metric-card {
    background: rgba(var(--v-theme-on-surface), 0.02);
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    transition: all 0.3s ease;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.04);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
