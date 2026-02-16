<script lang="ts" setup>
import { usePanelStore } from '@/stores/panel'
import type { PanelType } from '@/types'

const panelStore = usePanelStore()

const panels: Array<{ value: PanelType; label: string; icon: string; color: string }> = [
  { value: 'app', label: 'Ksiazka Zlecen', icon: 'tabler-book', color: '#7367F0' },
  { value: 'surveyor', label: 'Panel Geodety', icon: 'tabler-map-2', color: '#28C76F' },
  { value: 'contractor', label: 'Panel Wykonawcy', icon: 'tabler-building', color: '#FF9F43' },
  { value: 'admin', label: 'Panel Admina', icon: 'tabler-shield-lock', color: '#FF4C51' },
]
</script>

<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        variant="text"
        size="small"
        class="text-none"
      >
        <VIcon
          :icon="panels.find(p => p.value === panelStore.currentPanel)?.icon || 'tabler-book'"
          :color="panels.find(p => p.value === panelStore.currentPanel)?.color"
          size="20"
          class="me-1"
        />
        <span class="text-body-2 font-weight-medium">
          {{ panelStore.panelLabel }}
        </span>
        <VIcon
          icon="tabler-chevron-down"
          size="16"
          class="ms-1"
        />
      </VBtn>
    </template>

    <VList density="compact">
      <VListItem
        v-for="panel in panels"
        :key="panel.value"
        :active="panelStore.currentPanel === panel.value"
        @click="panelStore.switchPanel(panel.value)"
      >
        <template #prepend>
          <VIcon
            :icon="panel.icon"
            :color="panel.color"
            size="20"
          />
        </template>
        <VListItemTitle class="text-body-2">
          {{ panel.label }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>
