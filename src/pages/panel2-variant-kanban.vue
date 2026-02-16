<script lang="ts" setup>
import { orders, projects, users } from '@/data/mock'
import OrderProgressWidget from '@/components/OrderProgressWidget.vue'

// ── PANEL 2 VARIANT: "Kanban Style" ───────────────────
// Focus: Visual order management, drag-and-drop feel, status columns

// ── Status Configuration ──────────────────────────────
const statusConfig = {
  pending: {
    label: 'Oczekujące',
    color: 'warning',
    icon: 'tabler-clock',
    gradient: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)',
  },
  in_progress: {
    label: 'W Toku',
    color: 'info',
    icon: 'tabler-progress',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  completed: {
    label: 'Wykonane',
    color: 'success',
    icon: 'tabler-circle-check',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  postponed: {
    label: 'Odłożone',
    color: 'error',
    icon: 'tabler-calendar-pause',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  continuous: {
    label: 'Ciągłe',
    color: 'secondary',
    icon: 'tabler-refresh',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  canceled: {
    label: 'Anulowane',
    color: 'default',
    icon: 'tabler-circle-x',
    gradient: 'linear-gradient(135deg, #d7d2cc 0%, #304352 100%)',
  },
}

// ── Stats ──────────────────────────────────────────────
const statusCounts = computed(() => {
  const counts: Record<string, number> = {}
  Object.keys(statusConfig).forEach(status => {
    counts[status] = orders.filter(o => o.status === status).length
  })
  return counts
})

const totalOrders = orders.length

const activeProjects = computed(() =>
  projects.filter(p => !p.closed && !p.completed).length
)

const ordersCompletedThisWeek = computed(() => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return orders.filter(o => {
    if (o.status !== 'completed' || !o.execute_date) return false
    const d = new Date(o.execute_date)
    return d >= weekAgo && d <= now
  }).length
})

const avgCompletionTime = computed(() => {
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

// ── Quick Stats Cards ──────────────────────────────────
const quickStats = computed(() => [
  {
    title: 'Wszystkie Zlecenia',
    value: totalOrders,
    subtitle: 'łącznie w systemie',
    icon: 'tabler-clipboard-list',
    color: 'primary',
    trend: null,
  },
  {
    title: 'Aktywne Projekty',
    value: activeProjects.value,
    subtitle: 'wymagające uwagi',
    icon: 'tabler-building',
    color: 'info',
    trend: '+3',
  },
  {
    title: 'Wykonano w Tydzień',
    value: ordersCompletedThisWeek.value,
    subtitle: 'ostatnie 7 dni',
    icon: 'tabler-check',
    color: 'success',
    trend: '+12%',
  },
  {
    title: 'Średni Czas',
    value: `${avgCompletionTime.value}d`,
    subtitle: 'realizacji zlecenia',
    icon: 'tabler-clock-hour-4',
    color: 'warning',
    trend: '-2d',
  },
])

// ── Orders by Status ───────────────────────────────────
const ordersByStatus = computed(() => {
  const result: Record<string, typeof orders> = {}
  Object.keys(statusConfig).forEach(status => {
    result[status] = orders.filter(o => o.status === status)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })
  return result
})

// ── Team Members Quick Access ─────────────────────────
const activeTeamMembers = computed(() =>
  users.filter(u => u.type === 'surveyor' && u.is_active)
    .sort((a, b) => b.orders_count - a.orders_count)
    .slice(0, 6)
)

// ── Recent Activity ────────────────────────────────────
const recentActivity = computed(() =>
  [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(o => ({
      title: o.name,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('pl-PL'),
      location: o.location,
    }))
)

// ── Project Progress ───────────────────────────────────
function getProjectOrders(projectId: number) {
  return orders.filter(o => o.project_id === projectId)
}

const activeProjectsWithOrders = computed(() =>
  projects.filter(p => !p.closed && !p.completed && getProjectOrders(p.id).length > 0)
    .slice(0, 6)
)
</script>

<template>
  <div class="kanban-dashboard">
    <!-- ROW 1: Quick Stats -->
    <VRow class="mb-6">
      <VCol
        v-for="stat in quickStats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="stat-card">
          <VCardText class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <VAvatar
                :color="stat.color"
                variant="tonal"
                size="48"
                rounded
              >
                <VIcon
                  :icon="stat.icon"
                  size="26"
                />
              </VAvatar>
              <VChip
                v-if="stat.trend"
                color="success"
                size="x-small"
                variant="tonal"
              >
                {{ stat.trend }}
              </VChip>
            </div>
            <h4 class="text-h4 font-weight-bold mb-1">
              {{ stat.value }}
            </h4>
            <div class="text-body-1 font-weight-medium mb-1">
              {{ stat.title }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ stat.subtitle }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 2: Kanban Board - Status Columns -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="48"
              >
                <VIcon
                  icon="tabler-layout-kanban"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Zarządzanie Zleceniami - Widok Kanban
            </VCardTitle>
            <VCardSubtitle>Przegląd wszystkich zleceń według statusu</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <div class="kanban-board">
              <div
                v-for="(statusKey, statusLabel) in statusConfig"
                :key="statusLabel"
                class="kanban-column"
              >
                <div
                  class="kanban-column-header"
                  :style="{ background: statusKey.gradient }"
                >
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center gap-2">
                      <VIcon
                        :icon="statusKey.icon"
                        size="22"
                        color="white"
                      />
                      <h6 class="text-subtitle-1 font-weight-bold text-white">
                        {{ statusKey.label }}
                      </h6>
                    </div>
                    <VChip
                      color="white"
                      variant="flat"
                      size="small"
                    >
                      {{ statusCounts[statusLabel] }}
                    </VChip>
                  </div>
                </div>

                <div class="kanban-column-content">
                  <VCard
                    v-for="order in ordersByStatus[statusLabel].slice(0, 8)"
                    :key="order.id"
                    class="kanban-card mb-3"
                    :color="statusKey.color"
                    variant="tonal"
                  >
                    <VCardText class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <VChip
                          :color="statusKey.color"
                          size="x-small"
                          variant="flat"
                        >
                          #{{ order.id }}
                        </VChip>
                        <VBtn
                          icon="tabler-dots-vertical"
                          size="x-small"
                          variant="text"
                        />
                      </div>

                      <h6 class="text-subtitle-2 font-weight-bold mb-2">
                        {{ order.name }}
                      </h6>

                      <div class="d-flex align-center gap-2 mb-2">
                        <VIcon
                          icon="tabler-map-pin"
                          size="14"
                          color="medium-emphasis"
                        />
                        <span class="text-caption text-medium-emphasis">
                          {{ order.location }}
                        </span>
                      </div>

                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center gap-1">
                          <VIcon
                            icon="tabler-calendar"
                            size="14"
                            color="medium-emphasis"
                          />
                          <span class="text-caption">
                            {{ new Date(order.completion_date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) }}
                          </span>
                        </div>
                        <VAvatar
                          v-if="order.assigned_to"
                          size="24"
                          :color="statusKey.color"
                        >
                          <VIcon
                            icon="tabler-user"
                            size="14"
                          />
                        </VAvatar>
                      </div>
                    </VCardText>
                  </VCard>

                  <template v-if="ordersByStatus[statusLabel].length === 0">
                    <div class="text-center pa-4 text-medium-emphasis text-caption">
                      Brak zleceń
                    </div>
                  </template>

                  <template v-if="ordersByStatus[statusLabel].length > 8">
                    <VBtn
                      variant="text"
                      size="small"
                      block
                      class="mt-2"
                    >
                      + {{ ordersByStatus[statusLabel].length - 8 }} więcej
                    </VBtn>
                  </template>
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ROW 3: Project Progress + Team -->
    <VRow class="mb-6">
      <!-- Project Progress -->
      <VCol
        cols="12"
        md="8"
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
                  icon="tabler-chart-pie"
                  size="28"
                />
              </VAvatar>
            </template>
            <VCardTitle class="text-h5">
              Postęp Projektów
            </VCardTitle>
            <VCardSubtitle>Realizacja zleceń na aktywnych projektach</VCardSubtitle>
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
                  compact
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Team & Activity Sidebar -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-4">
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-users"
                  size="24"
                />
              </VAvatar>
            </template>
            <VCardTitle>Zespół</VCardTitle>
            <VCardSubtitle>Aktywni geodeci</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VList>
              <VListItem
                v-for="member in activeTeamMembers"
                :key="member.id"
                density="compact"
                class="px-0"
              >
                <template #prepend>
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
                </template>
                <VListItemTitle class="font-weight-medium">
                  {{ member.full_name }}
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ member.orders_count }} zleceń
                </VListItemSubtitle>
                <template #append>
                  <VChip
                    color="success"
                    size="x-small"
                    variant="dot"
                  >
                    Aktywny
                  </VChip>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>

        <VCard>
          <VCardItem class="pb-2">
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-history"
                  size="24"
                />
              </VAvatar>
            </template>
            <VCardTitle>Aktywność</VCardTitle>
            <VCardSubtitle>Ostatnie zmiany</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VTimeline
              side="end"
              density="compact"
              truncate-line="both"
            >
              <VTimelineItem
                v-for="activity in recentActivity"
                :key="`${activity.title}-${activity.date}`"
                :dot-color="statusConfig[activity.status].color"
                size="x-small"
              >
                <div class="d-flex flex-column">
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ activity.title }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ activity.location }} • {{ activity.date }}
                  </div>
                </div>
              </VTimelineItem>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.kanban-dashboard {
  .stat-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
  }

  // Kanban board layout
  .kanban-board {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-block-end: 8px;

    // Horizontal scrollbar styling
    &::-webkit-scrollbar {
      block-size: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(var(--v-theme-on-surface), 0.2);
      border-radius: 4px;
    }
  }

  .kanban-column {
    flex: 0 0 320px;
    min-inline-size: 320px;
    display: flex;
    flex-direction: column;

    .kanban-column-header {
      padding: 16px;
      border-radius: 8px 8px 0 0;
      margin-block-end: 8px;
    }

    .kanban-column-content {
      flex: 1;
      overflow-y: auto;
      max-block-size: 600px;
      padding-inline: 4px;

      // Custom scrollbar
      &::-webkit-scrollbar {
        inline-size: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(var(--v-theme-on-surface), 0.2);
        border-radius: 3px;
      }
    }
  }

  .kanban-card {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
