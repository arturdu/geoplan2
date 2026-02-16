<script lang="ts" setup>
import { orders, projects } from '@/data/mock'
import OrderProgressWidget from '@/components/OrderProgressWidget.vue'

// ── Panel 2: Orders & Tasks Management ────────────────

// Row 1: 4 Stat Cards
const ordersPending = computed(() =>
  orders.filter(o => o.status === 'pending').length
)

const ordersInProgress = computed(() =>
  orders.filter(o => o.status === 'in_progress').length
)

const ordersCompletedToday = computed(() => {
  const today = new Date()
  return orders.filter(o => {
    if (o.status !== 'completed' || !o.execute_date) return false
    const d = new Date(o.execute_date)
    return d.toDateString() === today.toDateString()
  }).length
})

const ordersOverdue = computed(() => {
  const now = new Date()
  return orders.filter(o => {
    if (o.status === 'completed' || o.status === 'canceled') return false
    const completionDate = new Date(o.completion_date)
    return completionDate < now
  }).length
})

const statCards = computed(() => [
  {
    title: 'Oczekujace',
    stats: String(ordersPending.value),
    icon: 'tabler-clock',
    color: 'warning',
    subtitle: 'do przydzielenia',
  },
  {
    title: 'W realizacji',
    stats: String(ordersInProgress.value),
    icon: 'tabler-progress',
    color: 'info',
    subtitle: 'trwajace prace',
  },
  {
    title: 'Wykonane dzisiaj',
    stats: String(ordersCompletedToday.value),
    icon: 'tabler-circle-check',
    color: 'success',
    subtitle: 'zamkniete dzis',
  },
  {
    title: 'Przeterminowane',
    stats: String(ordersOverdue.value),
    icon: 'tabler-alert-circle',
    color: ordersOverdue.value > 0 ? 'error' : 'secondary',
    subtitle: 'wymaga akcji',
  },
])

// ── Order Progress Widget ──────────────────────────────
function getProjectOrders(projectId: number) {
  return orders.filter(o => o.project_id === projectId)
}

const activeProjectsWithOrders = computed(() =>
  projects.filter(p => !p.closed && !p.completed && getProjectOrders(p.id).length > 0),
)

// ── Today's Orders Table ───────────────────────────────
const orderStatusColors: Record<string, string> = {
  completed: 'success',
  in_progress: 'info',
  pending: 'warning',
  continuous: 'secondary',
  postponed: 'error',
  canceled: 'default',
}

const orderStatusLabels: Record<string, string> = {
  completed: 'Wykonane',
  in_progress: 'W toku',
  pending: 'Oczekujace',
  continuous: 'Ciagle',
  postponed: 'Odlozone',
  canceled: 'Anulowane',
}

const filteredOrders = ref([...orders].sort((a, b) => {
  const statusOrder = { pending: 0, in_progress: 1, continuous: 2, postponed: 3, completed: 4, canceled: 5 }
  return statusOrder[a.status] - statusOrder[b.status]
}))

const filterStatus = ref<string | null>(null)

const applyFilter = (status: string | null) => {
  filterStatus.value = status
  if (status) {
    filteredOrders.value = orders.filter(o => o.status === status)
  }
  else {
    filteredOrders.value = [...orders].sort((a, b) => {
      const statusOrder = { pending: 0, in_progress: 1, continuous: 2, postponed: 3, completed: 4, canceled: 5 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
  }
}

// ── Quick Actions ──────────────────────────────────────
const quickActions = [
  {
    title: 'Nowe zlecenie',
    icon: 'tabler-plus',
    color: 'primary',
    description: 'Utworz nowe zlecenie',
  },
  {
    title: 'Przydziel geodete',
    icon: 'tabler-user-plus',
    color: 'info',
    description: 'Przypisz zlecenie',
  },
  {
    title: 'Raport postepow',
    icon: 'tabler-file-text',
    color: 'success',
    description: 'Generuj raport',
  },
  {
    title: 'Przegladaj projekty',
    icon: 'tabler-folder',
    color: 'warning',
    description: 'Wszystkie projekty',
  },
]

// ── Recent Updates ─────────────────────────────────────
const recentUpdates = computed(() => {
  return [...orders]
    .filter(o => o.status === 'completed' || o.status === 'in_progress')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
})
</script>

<template>
  <div>
    <!-- Row 1: 4 Stat Cards -->
    <VRow class="mb-6">
      <VCol
        v-for="card in statCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard>
          <VCardText class="pa-4 d-flex flex-column gap-2">
            <div class="d-flex align-center justify-space-between">
              <VAvatar
                :color="card.color"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon
                  :icon="card.icon"
                  size="26"
                />
              </VAvatar>
            </div>
            <div>
              <h4 class="text-h4 font-weight-bold">
                {{ card.stats }}
              </h4>
              <div class="text-body-1 font-weight-medium mt-1">
                {{ card.title }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ card.subtitle }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Row 2: Order Progress Widgets -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-chart-pie"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Postep projektow</VCardTitle>
            <VCardSubtitle>Realizacja zlecen na aktywnych projektach</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VRow>
              <VCol
                v-for="project in activeProjectsWithOrders"
                :key="project.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
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
    </VRow>

    <!-- Row 3: Orders Table + Quick Actions Sidebar -->
    <VRow>
      <!-- Orders Table -->
      <VCol
        cols="12"
        md="8"
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
                  icon="tabler-list"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Wszystkie zlecenia</VCardTitle>
            <VCardSubtitle>{{ filteredOrders.length }} zlecen</VCardSubtitle>
            <template #append>
              <VChip
                :color="filterStatus ? 'primary' : 'default'"
                size="small"
                @click="applyFilter(null)"
              >
                <VIcon
                  icon="tabler-filter"
                  size="16"
                  start
                />
                {{ filterStatus ? `Filtr: ${orderStatusLabels[filterStatus]}` : 'Wszystkie' }}
              </VChip>
            </template>
          </VCardItem>
          <VCardText>
            <!-- Filter Chips -->
            <div class="d-flex flex-wrap gap-2 mb-4">
              <VChip
                v-for="(label, status) in orderStatusLabels"
                :key="status"
                :color="filterStatus === status ? orderStatusColors[status] : 'default'"
                size="small"
                @click="applyFilter(status)"
              >
                {{ label }}
              </VChip>
            </div>

            <!-- Orders List -->
            <div class="orders-table-container">
              <VList>
                <VListItem
                  v-for="order in filteredOrders.slice(0, 20)"
                  :key="order.id"
                  class="border-b"
                >
                  <template #prepend>
                    <VAvatar
                      :color="orderStatusColors[order.status]"
                      variant="tonal"
                      rounded
                      size="36"
                    >
                      <VIcon
                        icon="tabler-clipboard"
                        size="18"
                      />
                    </VAvatar>
                  </template>
                  <VListItemTitle class="font-weight-medium">
                    {{ order.name }}
                  </VListItemTitle>
                  <VListItemSubtitle>
                    {{ order.location }} &bull; {{ new Date(order.created_at).toLocaleDateString('pl-PL') }}
                  </VListItemSubtitle>
                  <template #append>
                    <VChip
                      :color="orderStatusColors[order.status]"
                      size="small"
                      label
                    >
                      {{ orderStatusLabels[order.status] }}
                    </VChip>
                  </template>
                </VListItem>
              </VList>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Quick Actions Sidebar -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-4">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-bolt"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Szybkie akcje</VCardTitle>
            <VCardSubtitle>Najczesciej uzywane</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <div class="d-flex flex-column gap-3">
              <VCard
                v-for="action in quickActions"
                :key="action.title"
                :color="action.color"
                variant="tonal"
                class="action-card"
              >
                <VCardText class="pa-3">
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="action.color"
                      size="40"
                    >
                      <VIcon
                        :icon="action.icon"
                        size="22"
                      />
                    </VAvatar>
                    <div class="flex-grow-1">
                      <h6 class="text-subtitle-2 font-weight-bold mb-0">
                        {{ action.title }}
                      </h6>
                      <span class="text-caption">
                        {{ action.description }}
                      </span>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </div>
          </VCardText>
        </VCard>

        <!-- Recent Updates -->
        <VCard>
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="42"
              >
                <VIcon
                  icon="tabler-history"
                  size="26"
                />
              </VAvatar>
            </template>
            <VCardTitle>Ostatnie zmiany</VCardTitle>
            <VCardSubtitle>Niedawne aktualizacje</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VList>
              <VListItem
                v-for="order in recentUpdates"
                :key="order.id"
                density="compact"
              >
                <template #prepend>
                  <VIcon
                    :icon="order.status === 'completed' ? 'tabler-circle-check' : 'tabler-progress'"
                    :color="orderStatusColors[order.status]"
                    size="20"
                  />
                </template>
                <VListItemTitle class="text-caption">
                  {{ order.name }}
                </VListItemTitle>
                <VListItemSubtitle class="text-caption">
                  {{ orderStatusLabels[order.status] }}
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.orders-table-container {
  max-block-size: 600px;
  overflow-y: auto;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}
</style>
