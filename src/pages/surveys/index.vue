<script lang="ts" setup>
import { surveys as mockSurveys, projects, trades } from '@/data/mock'
import type { Survey, InspectorStatus } from '@/types'
import { inspectorStatusColors, inspectorStatusLabels } from '@/types'

const search = ref('')
const projectFilter = ref<number | null>(null)
const tradeFilter = ref<number | null>(null)
const inspectorStatusFilter = ref<string | ''>('')
const selected = ref<Survey[]>([])
const snackbar = ref(false)
const snackbarText = ref('')

const surveyList = ref<Survey[]>([...mockSurveys])

const projectOptions = projects.map(p => ({ title: p.name, value: p.id }))
const tradeOptions = trades.map(t => ({ title: t.name, value: t.id }))
const inspectorStatusOptions = Object.entries(inspectorStatusLabels).map(([value, label]) => ({
  title: label,
  value,
}))

const headers = [
  { title: 'Projekt', key: 'project.name', sortable: true },
  { title: 'Nazwa pliku', key: 'file_name', sortable: true },
  { title: 'Branza', key: 'trade.name', sortable: true },
  { title: 'Geodeta', key: 'user.full_name', sortable: true },
  { title: 'Status inspekcji', key: 'i_status', sortable: true },
  { title: 'Data dodania', key: 'created_at', sortable: true },
]

const filteredSurveys = computed(() => {
  return surveyList.value.filter(survey => {
    const matchesSearch = !search.value
      || survey.file_name.toLowerCase().includes(search.value.toLowerCase())
      || survey.project?.name.toLowerCase().includes(search.value.toLowerCase())

    const matchesProject = !projectFilter.value || survey.project_id === projectFilter.value
    const matchesTrade = !tradeFilter.value || survey.trade_id === tradeFilter.value
    const matchesInspectorStatus = !inspectorStatusFilter.value || survey.i_status === inspectorStatusFilter.value

    return matchesSearch && matchesProject && matchesTrade && matchesInspectorStatus
  })
})

function downloadPack() {
  if (selected.value.length === 0) {
    snackbarText.value = 'Zaznacz co najmniej jeden operat'
    snackbar.value = true
    return
  }
  snackbarText.value = `Pobieranie paczki z ${selected.value.length} operatami...`
  snackbar.value = true
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-file-certificate"
          size="24"
          class="me-1"
        />
        <span class="text-h5">Operaty Geodezyjne</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj operatow..."
          density="compact"
          hide-details
          style="max-inline-size: 250px;"
        />
        <VSelect
          v-model="projectFilter"
          :items="projectOptions"
          placeholder="Projekt"
          density="compact"
          hide-details
          clearable
          style="max-inline-size: 220px;"
        />
        <VSelect
          v-model="tradeFilter"
          :items="tradeOptions"
          placeholder="Branza"
          density="compact"
          hide-details
          clearable
          style="max-inline-size: 180px;"
        />
        <VSelect
          v-model="inspectorStatusFilter"
          :items="inspectorStatusOptions"
          placeholder="Status inspekcji"
          density="compact"
          hide-details
          clearable
          style="max-inline-size: 200px;"
        />
      </VCardTitle>

      <VDivider />

      <div
        v-if="selected.length > 0"
        class="d-flex align-center gap-4 pa-4 bg-surface"
      >
        <span class="text-body-2 text-medium-emphasis">
          Zaznaczono: {{ selected.length }}
        </span>
        <VBtn
          color="primary"
          size="small"
          prepend-icon="tabler-download"
          @click="downloadPack"
        >
          Pobierz Paczke
        </VBtn>
      </div>

      <VDataTable
        v-model="selected"
        :headers="headers"
        :items="filteredSurveys"
        :search="search"
        :items-per-page="10"
        show-select
        return-object
        hover
      >
        <template #item.project.name="{ item }">
          <span class="font-weight-bold text-warning">{{ item.project?.name }}</span>
        </template>

        <template #item.file_name="{ item }">
          <a
            :href="item.file_url"
            class="text-decoration-none"
            target="_blank"
          >
            <VIcon
              icon="tabler-file-description"
              size="16"
              class="me-1"
            />
            {{ item.file_name }}
          </a>
        </template>

        <template #item.trade.name="{ item }">
          {{ item.trade?.name }}
        </template>

        <template #item.user.full_name="{ item }">
          <span class="text-medium-emphasis">{{ item.user.full_name }}</span>
        </template>

        <template #item.i_status="{ item }">
          <VChip
            v-if="item.i_status"
            :color="inspectorStatusColors[item.i_status]"
            size="small"
            label
          >
            {{ inspectorStatusLabels[item.i_status] }}
          </VChip>
          <span
            v-else
            class="text-caption text-medium-emphasis"
          >Brak</span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">
            <VIcon
              icon="tabler-file-off"
              size="48"
              class="mb-3 d-block mx-auto"
              color="secondary"
            />
            Brak operatow do wyswietlenia
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar"
      color="info"
      :timeout="3000"
    >
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>
