<script lang="ts" setup>
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'vuetify'
import { orders, posts, projects, users, weatherData } from '@/data/mock'
import { postCategoryColors, postCategoryLabels } from '@/types'
import type { WeatherData } from '@/types'
import { hexToRgb } from '@layouts/utils'

// ── Theme ─────────────────────────────────────────────
const vuetifyTheme = useTheme()
const router = useRouter()

// ── IMPROVED MAIN DASHBOARD ───────────────────────────
// Focus: Overview, Navigation Hub, Quick Access

// ── Welcome Message ────────────────────────────────────
const currentTime = new Date().getHours()
const greeting = computed(() => {
  if (currentTime < 12) return 'Dzień dobry'
  if (currentTime < 18) return 'Witaj'
  return 'Dobry wieczór'
})

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// ── Hero Stats (Large, Impressive) ────────────────────
const activeContracts = projects.filter(p => !p.closed && !p.completed).length
const totalProjects = projects.length
const inProgressOrders = orders.filter(o => o.status === 'in_progress').length
const activeTeamsCount = users.filter(u => u.type === 'surveyor' && u.is_active && u.lon && u.lat).length
const completedToday = computed(() => {
  const today = new Date()
  return orders.filter(o => {
    if (o.status !== 'completed' || !o.execute_date) return false
    const d = new Date(o.execute_date)
    return d.toDateString() === today.toDateString()
  }).length
})

const heroStats = computed(() => [
  {
    title: 'Aktywne Projekty',
    value: activeContracts,
    total: totalProjects,
    icon: 'tabler-building-bridge-2',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    subtitle: 'w realizacji',
  },
  {
    title: 'Zlecenia w Toku',
    value: inProgressOrders,
    icon: 'tabler-progress',
    color: 'info',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    subtitle: 'aktywnych prac',
  },
  {
    title: 'Ekipy w Terenie',
    value: activeTeamsCount,
    icon: 'tabler-users',
    color: 'success',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    subtitle: 'geodetów online',
  },
  {
    title: 'Wykonane Dzisiaj',
    value: completedToday.value,
    icon: 'tabler-circle-check',
    color: 'warning',
    gradient: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)',
    subtitle: 'zakończone zlecenia',
  },
])

// ── Dashboard Navigation Cards ─────────────────────────
const dashboardCards = [
  {
    title: 'Kontrola Operacji',
    description: 'Centrum kontroli terenu, GPS tracking, monitoring pogody',
    icon: 'tabler-radar',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    route: '/operations-control',
    stats: `${activeTeamsCount} ekip • ${weatherData.length} lokacji`,
  },
  {
    title: 'Zarządzanie Zleceniami',
    description: 'Kanban board, przydzielanie zadań, tracking postępu',
    icon: 'tabler-layout-kanban',
    color: 'success',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    route: '/orders-kanban',
    stats: `${orders.filter(o => o.status === 'pending').length} oczekujących • ${orders.filter(o => o.status === 'in_progress').length} w toku`,
  },
  {
    title: 'Analityka Wykonawcza',
    description: 'KPI, raporty wydajności, ranking zespołu',
    icon: 'tabler-chart-line',
    color: 'info',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    route: '/analytics-executive',
    stats: `${Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)}% realizacji`,
  },
]

// ── Quick Actions ──────────────────────────────────────
const quickActions = [
  {
    title: 'Nowe Zlecenie',
    icon: 'tabler-plus',
    color: 'primary',
    action: () => console.log('Nowe zlecenie'),
  },
  {
    title: 'Przydziel Zadanie',
    icon: 'tabler-user-plus',
    color: 'info',
    action: () => console.log('Przydziel zadanie'),
  },
  {
    title: 'Generuj Raport',
    icon: 'tabler-file-text',
    color: 'success',
    action: () => console.log('Generuj raport'),
  },
  {
    title: 'Zobacz Mapę',
    icon: 'tabler-map-2',
    color: 'warning',
    action: () => router.push('/operations-control'),
  },
]

// ── Recent Activity ────────────────────────────────────
const recentActivity = computed(() => {
  const activities: any[] = []

  // Recent completed orders
  orders
    .filter(o => o.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .forEach(order => {
      activities.push({
        type: 'order_completed',
        title: `Zlecenie zakończone: ${order.name}`,
        subtitle: order.location,
        time: new Date(order.created_at),
        icon: 'tabler-circle-check',
        color: 'success',
      })
    })

  // Recent posts
  posts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2)
    .forEach(post => {
      activities.push({
        type: 'post',
        title: post.title,
        subtitle: `Autor: ${post.author.full_name}`,
        time: new Date(post.created_at),
        icon: 'tabler-news',
        color: postCategoryColors[post.category],
      })
    })

  // Recent orders in progress
  orders
    .filter(o => o.status === 'in_progress')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2)
    .forEach(order => {
      activities.push({
        type: 'order_progress',
        title: `W toku: ${order.name}`,
        subtitle: order.location,
        time: new Date(order.created_at),
        icon: 'tabler-progress',
        color: 'info',
      })
    })

  return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6)
})

const formatActivityTime = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diff < 1) return 'teraz'
  if (diff < 60) return `${diff} min temu`
  if (diff < 1440) return `${Math.floor(diff / 60)}h temu`
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
}

// ── Weather Mini Widget ────────────────────────────────
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

// ── Navigation ─────────────────────────────────────────
const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="main-dashboard-improved">
    <!-- Hero Welcome Banner -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard class="hero-banner">
          <VCardText class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap gap-4">
              <div>
                <h2 class="text-h2 font-weight-bold mb-2">
                  {{ greeting }} 👋
                </h2>
                <p class="text-h6 text-medium-emphasis mb-0">
                  {{ currentDate }}
                </p>
              </div>
              <div class="d-flex align-center gap-3">
                <VChip
                  color="success"
                  size="large"
                  variant="tonal"
                >
                  <VIcon
                    icon="tabler-circle-check"
                    start
                    size="20"
                  />
                  System Online
                </VChip>
                <VChip
                  color="info"
                  size="large"
                  variant="tonal"
                >
                  <div class="d-flex align-center gap-1">
                    <span class="live-pulse-dot" />
                    {{ activeTeamsCount }} Ekip Online
                  </div>
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Hero Stats Row -->
    <VRow class="mb-6">
      <VCol
        v-for="stat in heroStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="hero-stat-card h-100">
          <VCardText class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <VAvatar
                size="64"
                rounded
                :style="{ background: stat.gradient }"
                class="stat-icon"
              >
                <VIcon
                  :icon="stat.icon"
                  size="36"
                  color="white"
                />
              </VAvatar>
            </div>
            <h3 class="text-h3 font-weight-bold mb-2">
              {{ stat.value }}
              <span
                v-if="stat.total"
                class="text-body-1 text-medium-emphasis"
              >
                / {{ stat.total }}
              </span>
            </h3>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ stat.title }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ stat.subtitle }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dashboard Navigation Cards -->
    <VRow class="mb-6">
      <VCol cols="12">
        <h4 class="text-h4 font-weight-bold mb-4" style="letter-spacing: -0.02em;">
          Panele Kontrolne
        </h4>
      </VCol>
      <VCol
        v-for="dashboard in dashboardCards"
        :key="dashboard.title"
        cols="12"
        md="4"
      >
        <VCard
          class="dashboard-nav-card h-100"
          @click="navigateTo(dashboard.route)"
        >
          <VCardText class="pa-5">
            <div class="d-flex align-center gap-4 mb-4">
              <VAvatar
                size="72"
                rounded
                :style="{ background: dashboard.gradient }"
                class="nav-icon"
              >
                <VIcon
                  :icon="dashboard.icon"
                  size="40"
                  color="white"
                />
              </VAvatar>
              <div class="flex-grow-1">
                <h5 class="text-h5 font-weight-bold mb-2">
                  {{ dashboard.title }}
                </h5>
                <VChip
                  size="small"
                  :color="dashboard.color"
                  variant="tonal"
                >
                  {{ dashboard.stats }}
                </VChip>
              </div>
            </div>
            <p class="text-body-1 text-medium-emphasis mb-3">
              {{ dashboard.description }}
            </p>
            <VBtn
              :color="dashboard.color"
              variant="tonal"
              block
              append-icon="tabler-arrow-right"
            >
              Otwórz Panel
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Quick Actions + Activity + Weather -->
    <VRow class="mb-6">
      <!-- Quick Actions -->
      <VCol
        cols="12"
        md="4"
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
                  icon="tabler-bolt"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5 font-weight-bold">
              Szybkie Akcje
            </VCardTitle>
            <VCardSubtitle class="text-body-2">Najczęściej używane</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <div class="d-flex flex-column gap-3">
              <VCard
                v-for="action in quickActions"
                :key="action.title"
                :color="action.color"
                variant="tonal"
                class="quick-action-card"
                @click="action.action"
              >
                <VCardText class="pa-3">
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="action.color"
                      size="48"
                    >
                      <VIcon
                        :icon="action.icon"
                        size="26"
                      />
                    </VAvatar>
                    <div class="flex-grow-1">
                      <h6 class="text-subtitle-1 font-weight-bold">
                        {{ action.title }}
                      </h6>
                    </div>
                    <VIcon
                      icon="tabler-chevron-right"
                      size="20"
                    />
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Recent Activity -->
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
                  icon="tabler-activity"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5 font-weight-bold">
              Ostatnia Aktywność
            </VCardTitle>
            <VCardSubtitle class="text-body-2">Co się dzieje</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VTimeline
              side="end"
              density="compact"
              truncate-line="both"
              class="activity-timeline"
            >
              <VTimelineItem
                v-for="(activity, idx) in recentActivity"
                :key="idx"
                :dot-color="activity.color"
                size="x-small"
              >
                <template #icon>
                  <VIcon
                    :icon="activity.icon"
                    size="12"
                  />
                </template>
                <div class="d-flex justify-space-between align-center mb-1">
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ activity.title }}
                  </div>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatActivityTime(activity.time) }}
                  </span>
                </div>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ activity.subtitle }}
                </p>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Weather Mini -->
      <VCol
        cols="12"
        md="4"
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
                  icon="tabler-cloud"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5 font-weight-bold">
              Pogoda
            </VCardTitle>
            <VCardSubtitle class="text-body-2">Warunki terenowe</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <div class="d-flex flex-column gap-2">
              <VCard
                v-for="weather in (weatherData as WeatherData[]).slice(0, 3)"
                :key="weather.project_name"
                variant="tonal"
                :color="getWeatherColor(weather.current.icon)"
                class="weather-mini-card"
              >
                <VCardText class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold mb-1">
                        {{ weather.project_name }}
                      </div>
                      <div class="text-body-2 text-capitalize">
                        {{ weather.current.description }}
                      </div>
                    </div>
                    <div class="text-center">
                      <VIcon
                        :icon="getWeatherIcon(weather.current.icon)"
                        size="32"
                        :color="getWeatherColor(weather.current.icon)"
                        class="mb-1"
                      />
                      <div class="text-h6 font-weight-bold">
                        {{ weather.current.temp }}°
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>

              <VBtn
                variant="tonal"
                color="info"
                block
                size="small"
                @click="navigateTo('/operations-control')"
              >
                Zobacz wszystkie
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Team Performance Mini -->
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-users"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5 font-weight-bold">
              Zespół Geodetów
            </VCardTitle>
            <VCardSubtitle class="text-body-2">Top wykonawcy</VCardSubtitle>
            <template #append>
              <VBtn
                variant="text"
                color="primary"
                @click="navigateTo('/analytics-executive')"
              >
                Zobacz ranking
                <VIcon
                  icon="tabler-arrow-right"
                  end
                />
              </VBtn>
            </template>
          </VCardItem>
          <VCardText>
            <VRow>
              <VCol
                v-for="(member, idx) in users.filter(u => u.type === 'surveyor').sort((a, b) => b.orders_count - a.orders_count).slice(0, 6)"
                :key="member.id"
                cols="12"
                sm="6"
                md="2"
              >
                <VCard
                  variant="tonal"
                  :color="idx === 0 ? 'warning' : idx === 1 ? 'default' : 'info'"
                  class="team-member-mini"
                >
                  <VCardText class="pa-3 text-center">
                    <VAvatar
                      :color="idx === 0 ? 'warning' : idx === 1 ? 'default' : 'info'"
                      size="56"
                      class="mb-2"
                    >
                      <VIcon
                        icon="tabler-user"
                        size="28"
                      />
                    </VAvatar>
                    <div class="text-subtitle-2 font-weight-bold mb-1">
                      {{ member.full_name }}
                    </div>
                    <VChip
                      size="x-small"
                      :color="member.is_active ? 'success' : 'default'"
                      variant="tonal"
                    >
                      {{ member.orders_count }} zleceń
                    </VChip>
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
.main-dashboard-improved {
  // Hero Banner
  .hero-banner {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-secondary), 0.1) 100%);
    border: 2px solid rgba(var(--v-theme-primary), 0.2);
  }

  // Hero Stat Cards
  .hero-stat-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);

      .stat-icon {
        transform: scale(1.1) rotate(-5deg);
      }
    }

    .stat-icon {
      transition: transform 0.4s ease;
    }
  }

  // Dashboard Navigation Cards
  .dashboard-nav-card {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
      border-color: rgba(var(--v-theme-primary), 0.5);

      .nav-icon {
        transform: scale(1.1);
      }
    }

    .nav-icon {
      transition: transform 0.3s ease;
    }
  }

  // Quick Action Cards
  .quick-action-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  // Activity Timeline
  .activity-timeline {
    max-block-size: 380px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      inline-size: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(var(--v-theme-on-surface), 0.2);
      border-radius: 2px;
    }
  }

  // Weather Mini Cards
  .weather-mini-card {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  // Team Member Mini
  .team-member-mini {
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }
  }

  // Live pulse dot
  .live-pulse-dot {
    display: inline-block;
    block-size: 8px;
    inline-size: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse-dot 2s ease-out infinite;
  }

  @keyframes pulse-dot {
    0% {
      box-shadow: 0 0 0 0 currentColor;
      opacity: 1;
    }
    70% {
      box-shadow: 0 0 0 8px transparent;
      opacity: 0;
    }
    100% {
      box-shadow: 0 0 0 0 transparent;
      opacity: 0;
    }
  }
}
</style>
