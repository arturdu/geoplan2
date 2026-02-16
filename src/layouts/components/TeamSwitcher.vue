<script lang="ts" setup>
import { usePanelStore } from '@/stores/panel'

const panelStore = usePanelStore()
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
        <VAvatar
          size="24"
          color="primary"
          variant="tonal"
          class="me-1"
        >
          <span class="text-caption font-weight-bold">{{ panelStore.currentTeam?.short }}</span>
        </VAvatar>
        <span class="text-body-2 d-none d-md-inline">
          {{ panelStore.currentTeam?.name }}
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
        v-for="team in panelStore.teams"
        :key="team.id"
        :active="panelStore.currentTeamId === team.id"
        @click="panelStore.switchTeam(team.id)"
      >
        <template #prepend>
          <VAvatar
            size="28"
            color="primary"
            variant="tonal"
          >
            <span class="text-caption font-weight-bold">{{ team.short }}</span>
          </VAvatar>
        </template>
        <VListItemTitle class="text-body-2">
          {{ team.name }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>
