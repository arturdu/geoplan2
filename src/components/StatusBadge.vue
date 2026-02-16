<script lang="ts" setup>
import { orderStatusColors, orderStatusLabels, inspectorStatusColors, inspectorStatusLabels } from '@/types'

const props = defineProps<{
  status: string
  type?: 'order' | 'inspector'
  size?: 'small' | 'default'
}>()

const color = computed(() => {
  if (props.type === 'inspector') {
    return inspectorStatusColors[props.status] || 'secondary'
  }
  return orderStatusColors[props.status as keyof typeof orderStatusColors] || 'secondary'
})

const label = computed(() => {
  if (props.type === 'inspector') {
    return inspectorStatusLabels[props.status] || props.status
  }
  return orderStatusLabels[props.status as keyof typeof orderStatusLabels] || props.status
})
</script>

<template>
  <VChip
    :color="color"
    :size="size || 'small'"
    variant="tonal"
    label
  >
    {{ label }}
  </VChip>
</template>
