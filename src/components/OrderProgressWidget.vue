<script lang="ts" setup>
import type { Order, OrderStatus, Project } from '@/types'
import { orderStatusColors, orderStatusLabels } from '@/types'

const props = withDefaults(defineProps<{
  project: Project
  orders: Order[]
  showDetails?: boolean
  compact?: boolean
}>(), {
  showDetails: false,
  compact: false,
})

// ── Status breakdown ─────────────────────────────────
const statusBreakdown = computed(() => {
  const counts: Record<OrderStatus, number> = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    postponed: 0,
    continuous: 0,
    canceled: 0,
  }

  props.orders.forEach(o => {
    counts[o.status]++
  })

  return counts
})

const totalOrders = computed(() => props.orders.length)

const completedCount = computed(() => statusBreakdown.value.completed)

const progressPercent = computed(() => {
  if (totalOrders.value === 0) return 0
  return Math.round((completedCount.value / totalOrders.value) * 100)
})

// ── Overdue detection ────────────────────────────────
const overdueOrders = computed(() => {
  const now = new Date()
  return props.orders.filter(o => {
    if (o.status === 'completed' || o.status === 'canceled') return false
    const completionDate = new Date(o.completion_date)
    return completionDate < now
  })
})

const hasOverdue = computed(() => overdueOrders.value.length > 0)

// ── Active statuses for display ──────────────────────
const activeStatuses = computed(() => {
  const statuses: Array<{ status: OrderStatus; count: number; color: string; label: string }> = []

  const order: OrderStatus[] = ['completed', 'in_progress', 'pending', 'continuous', 'postponed', 'canceled']

  order.forEach(s => {
    if (statusBreakdown.value[s] > 0) {
      statuses.push({
        status: s,
        count: statusBreakdown.value[s],
        color: orderStatusColors[s],
        label: orderStatusLabels[s],
      })
    }
  })

  return statuses
})

// ── Progress bar color ───────────────────────────────
const progressColor = computed(() => {
  if (hasOverdue.value) return 'error'
  if (progressPercent.value >= 75) return 'success'
  if (progressPercent.value >= 40) return 'info'
  return 'warning'
})
</script>

<template>
  <VCard class="order-progress-widget" :class="{ 'order-progress-widget--compact': compact }">
    <VCardText :class="compact ? 'pa-3' : 'pa-4'">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="flex-grow-1 overflow-hidden">
          <h6 :class="compact ? 'text-subtitle-2' : 'text-subtitle-1'" class="font-weight-bold text-truncate mb-0">
            {{ project.name }}
          </h6>
          <span v-if="!compact && project.info" class="text-caption text-medium-emphasis d-block text-truncate">
            {{ project.info }}
          </span>
        </div>
        <VChip
          :color="progressColor"
          size="small"
          label
          class="ms-2 flex-shrink-0"
        >
          {{ progressPercent }}%
        </VChip>
      </div>

      <!-- Progress bar -->
      <VProgressLinear
        :model-value="progressPercent"
        :color="progressColor"
        :height="compact ? 6 : 8"
        rounded
        class="mb-2"
      />

      <!-- Stats row -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption text-medium-emphasis">
          {{ completedCount }} / {{ totalOrders }} zlecen
        </span>
        <span v-if="project.deadline_active" class="text-caption text-medium-emphasis">
          Termin: {{ project.deadline }}
        </span>
      </div>

      <!-- Status dots -->
      <div class="d-flex flex-wrap gap-2 mt-2">
        <div
          v-for="s in activeStatuses"
          :key="s.status"
          class="d-flex align-center gap-1"
        >
          <span
            class="status-dot"
            :style="{ background: `rgb(var(--v-theme-${s.color}))` }"
          />
          <span class="text-caption">
            {{ s.label }}: <strong>{{ s.count }}</strong>
          </span>
        </div>
      </div>

      <!-- Overdue warning -->
      <VAlert
        v-if="hasOverdue"
        type="error"
        variant="tonal"
        density="compact"
        :class="compact ? 'mt-2' : 'mt-3'"
      >
        <template #prepend>
          <VIcon icon="tabler-alert-triangle" size="18" />
        </template>
        {{ overdueOrders.length }} {{ overdueOrders.length === 1 ? 'zlecenie przeterminowane' : 'zlecen przeterminowanych' }}
      </VAlert>

      <!-- Details section -->
      <template v-if="showDetails && !compact">
        <VDivider class="my-3" />
        <div class="d-flex flex-column gap-2">
          <div
            v-for="s in activeStatuses"
            :key="s.status"
            class="d-flex align-center justify-space-between"
          >
            <div class="d-flex align-center gap-2">
              <VChip :color="s.color" size="x-small" variant="tonal" label>
                {{ s.label }}
              </VChip>
            </div>
            <div class="d-flex align-center gap-2">
              <span class="text-body-2 font-weight-medium">{{ s.count }}</span>
              <VProgressLinear
                :model-value="totalOrders > 0 ? (s.count / totalOrders) * 100 : 0"
                :color="s.color"
                height="4"
                rounded
                style="inline-size: 60px;"
              />
            </div>
          </div>
        </div>
      </template>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.order-progress-widget {
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &--compact {
    &:hover {
      transform: translateY(-1px);
    }
  }
}

.status-dot {
  display: inline-block;
  block-size: 8px;
  border-radius: 50%;
  inline-size: 8px;
}
</style>
