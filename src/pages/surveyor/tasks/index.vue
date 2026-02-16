<script lang="ts" setup>
import { edzrgTasks, workTypes, clients, users } from '@/data/mock'
import type { EdzrgTask, TaskPriority } from '@/types'
import { taskPriorityColors } from '@/types'

// ── State ───────────────────────────────────────────────
const search = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const expandedPanels = ref([0])

const tableItems = ref<EdzrgTask[]>([...edzrgTasks])

// ── Default item ────────────────────────────────────────
const defaultItem: Partial<EdzrgTask> = {
  task_no: '',
  priority: 'standard',
  work_id: 1,
  client_id: 1,
  powiat: '',
  miasto: '',
  gmina: '',
  obreb: '',
  plot_no: '',
  ulica: '',
  kodgik: '',
  net: 0,
  vat: 23,
  gross: 0,
  info: '',
  reported: null,
  measurements: null,
  measurements_surveyor_id: null,
  study: null,
  study_performer_id: null,
  field: null,
  handed: null,
  picked: null,
  received: null,
  paid: null,
  attachments: [],
}

const editedItem = ref<Partial<EdzrgTask>>({ ...defaultItem })

// ── Options ─────────────────────────────────────────────
const workOptions = workTypes.map(w => ({ title: w.name, value: w.id }))
const clientOptions = clients.map(c => ({ title: c.full_name, value: c.id }))
const surveyorUsers = users.filter(u => u.type === 'surveyor')
const surveyorOptions = surveyorUsers.map(u => ({ title: u.full_name, value: u.id }))
const priorityOptions: { title: string; value: TaskPriority }[] = [
  { title: 'Niski', value: 'niski' },
  { title: 'Standard', value: 'standard' },
  { title: 'Wysoki', value: 'wysoki' },
  { title: 'Hiper', value: 'hiper' },
]

// ── Statistics ──────────────────────────────────────────
const totalTasks = computed(() => tableItems.value.length)

const highPriorityTasks = computed(() =>
  tableItems.value.filter(t => t.priority === 'hiper').length,
)

const dueThisWeekTasks = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return tableItems.value.filter(t => {
    if (!t.handed) return false
    const d = new Date(t.handed)
    return d >= startOfWeek && d <= endOfWeek
  }).length
})

const completedThisMonthTasks = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  return tableItems.value.filter(t => {
    if (!t.paid) return false
    const d = new Date(t.paid)
    return d.getFullYear() === year && d.getMonth() === month
  }).length
})

// ── Helpers ─────────────────────────────────────────────
function priorityBorderColor(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    niski: '#A8AAAE',
    standard: '#7367F0',
    wysoki: '#FF9F43',
    hiper: '#EA5455',
  }
  return map[priority]
}

function priorityIcon(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    niski: 'tabler-arrow-down',
    standard: 'tabler-minus',
    wysoki: 'tabler-arrow-up',
    hiper: 'tabler-alert-circle',
  }
  return map[priority]
}

function calcGross() {
  const net = editedItem.value.net || 0
  const vat = editedItem.value.vat || 0
  editedItem.value.gross = Math.round(net * (1 + vat / 100) * 100) / 100
}

function clientDisplay(clientId: number): string {
  const c = clients.find(cl => cl.id === clientId)
  if (!c) return '-'
  return c.company ? `${c.full_name} (${c.company})` : c.full_name
}

function workName(workId: number): string {
  return workTypes.find(w => w.id === workId)?.name || '-'
}

function surveyorName(id: number | null | undefined): string {
  if (!id) return '-'
  return users.find(u => u.id === id)?.full_name || '-'
}

// ── Table headers ───────────────────────────────────────
const headers = [
  { title: 'Nr sprawy', key: 'task_no', sortable: true },
  { title: 'Utworzono', key: 'created_at', sortable: true },
  { title: 'Rodzaj pracy', key: 'work_id', sortable: true },
  { title: 'Klient', key: 'client_id', sortable: true },
  { title: 'Dzialka', key: 'plot_no', sortable: true },
  { title: 'Brutto', key: 'gross', sortable: true },
  { title: 'Informacje', key: 'info', sortable: false },
  { title: 'Zgloszono', key: 'reported', sortable: true },
  { title: 'Pomiary', key: 'measurements', sortable: true },
  { title: 'Opracowanie', key: 'study', sortable: true },
  { title: 'Terenowe', key: 'field', sortable: true },
  { title: 'Przekazano', key: 'handed', sortable: true },
  { title: 'Odebrano', key: 'picked', sortable: true },
  { title: 'Otrzymano', key: 'received', sortable: true },
  { title: 'Zaplacono', key: 'paid', sortable: true },
  { title: 'Zalaczniki', key: 'attachments', sortable: false },
  { title: 'Akcje', key: 'actions', sortable: false },
]

// ── Methods ─────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  expandedPanels.value = [0]
  dialogVisible.value = true
}

function openEdit(item: EdzrgTask) {
  isEditing.value = true
  editedItem.value = { ...item, attachments: [...item.attachments] }
  expandedPanels.value = [0]
  dialogVisible.value = true
}

function saveItem() {
  if (isEditing.value) {
    const idx = tableItems.value.findIndex(t => t.id === editedItem.value.id)
    if (idx !== -1) {
      tableItems.value[idx] = {
        ...tableItems.value[idx],
        ...editedItem.value,
        work: workTypes.find(w => w.id === editedItem.value.work_id),
        client: clients.find(c => c.id === editedItem.value.client_id),
      } as EdzrgTask
    }
  } else {
    const newId = Math.max(...tableItems.value.map(t => t.id)) + 1
    const now = new Date().toISOString().slice(0, 10)
    tableItems.value.push({
      ...defaultItem,
      ...editedItem.value,
      id: newId,
      task_no: `EDZ/2025/${String(newId).padStart(4, '0')}`,
      work: workTypes.find(w => w.id === editedItem.value.work_id),
      client: clients.find(c => c.id === editedItem.value.client_id),
      creator: { full_name: 'Jan Kowalski' },
      created_at: now,
    } as EdzrgTask)
  }
  dialogVisible.value = false
}

function deleteItem(item: EdzrgTask) {
  tableItems.value = tableItems.value.filter(t => t.id !== item.id)
}
</script>

<template>
  <div>
    <!-- Statistics Cards -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="text-center" variant="tonal" color="primary">
          <VCardText class="pa-4">
            <VIcon
              icon="tabler-list-check"
              size="40"
              color="primary"
              class="mb-2"
            />
            <div class="text-h4 font-weight-bold">
              {{ totalTasks }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Wszystkie zadania
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="text-center" variant="tonal" color="error">
          <VCardText class="pa-4">
            <VIcon
              icon="tabler-alert-circle"
              size="40"
              color="error"
              class="mb-2"
            />
            <div class="text-h4 font-weight-bold">
              {{ highPriorityTasks }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Wysoki priorytet
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="text-center" variant="tonal" color="warning">
          <VCardText class="pa-4">
            <VIcon
              icon="tabler-calendar-week"
              size="40"
              color="warning"
              class="mb-2"
            />
            <div class="text-h4 font-weight-bold">
              {{ dueThisWeekTasks }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Termin w tym tyg.
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard class="text-center" variant="tonal" color="success">
          <VCardText class="pa-4">
            <VIcon
              icon="tabler-circle-check"
              size="40"
              color="success"
              class="mb-2"
            />
            <div class="text-h4 font-weight-bold">
              {{ completedThisMonthTasks }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Zakonczono (mies.)
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon
          icon="tabler-list-check"
          size="24"
          class="me-2"
        />
        <span>Zadania EDZRG</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          label="Szukaj nr sprawy..."
          density="compact"
          variant="outlined"
          hide-details
          class="me-4"
          style="max-width: 300px"
        />
        <VBtn color="primary" prepend-icon="tabler-plus" @click="openCreate">
          Nowe Zadanie
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="tableItems"
        :search="search"
        :items-per-page="25"
        density="comfortable"
        hover
        class="tasks-table"
        :row-props="({ item }: any) => ({
          style: `border-left: 6px solid ${priorityBorderColor(item.priority)}`,
        })"
      >
        <!-- Task no with priority icon -->
        <template #item.task_no="{ item }">
          <div class="d-flex align-center gap-2">
            <VIcon
              :icon="priorityIcon(item.priority)"
              :color="taskPriorityColors[item.priority]"
              size="18"
            />
            <span class="font-weight-bold text-body-2">{{ item.task_no }}</span>
          </div>
        </template>

        <!-- Created at with creator name -->
        <template #item.created_at="{ item }">
          <div>
            <div class="text-xs text-medium-emphasis">{{ item.creator.full_name }}</div>
            <div>{{ item.created_at }}</div>
          </div>
        </template>

        <!-- Work name -->
        <template #item.work_id="{ item }">
          <span style="white-space: normal; word-break: break-word">{{ workName(item.work_id) }}</span>
        </template>

        <!-- Client -->
        <template #item.client_id="{ item }">
          <div>
            <span>{{ item.client?.full_name || '-' }}</span>
            <div v-if="item.client?.company" class="text-xs text-medium-emphasis">
              {{ item.client.company }}
            </div>
          </div>
        </template>

        <!-- Plot no with address -->
        <template #item.plot_no="{ item }">
          <div class="text-xs">
            <div>{{ item.miasto }}, {{ item.obreb }}</div>
            <div class="font-weight-medium">dz. {{ item.plot_no }}</div>
            <div v-if="item.ulica" class="text-medium-emphasis">{{ item.ulica }}</div>
          </div>
        </template>

        <!-- Gross with breakdown -->
        <template #item.gross="{ item }">
          <div class="text-xs">
            <div>netto: {{ item.net.toFixed(2) }} zl</div>
            <div>VAT: {{ item.vat }}%</div>
            <div class="font-weight-bold">brutto: {{ item.gross.toFixed(2) }} zl</div>
          </div>
        </template>

        <!-- Info -->
        <template #item.info="{ item }">
          <div style="max-width: 320px; white-space: normal; word-break: break-word" class="text-xs">
            {{ item.info || '-' }}
          </div>
        </template>

        <!-- Date columns with surveyor -->
        <template #item.measurements="{ item }">
          <div v-if="item.measurements">
            <div>{{ item.measurements }}</div>
            <div class="text-xs text-medium-emphasis">{{ surveyorName(item.measurements_surveyor_id) }}</div>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template #item.study="{ item }">
          <div v-if="item.study">
            <div>{{ item.study }}</div>
            <div class="text-xs text-medium-emphasis">{{ surveyorName(item.study_performer_id) }}</div>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Simple date columns -->
        <template #item.reported="{ item }">
          <span>{{ item.reported || '-' }}</span>
        </template>
        <template #item.field="{ item }">
          <span>{{ item.field || '-' }}</span>
        </template>
        <template #item.handed="{ item }">
          <span>{{ item.handed || '-' }}</span>
        </template>
        <template #item.picked="{ item }">
          <span>{{ item.picked || '-' }}</span>
        </template>
        <template #item.received="{ item }">
          <span>{{ item.received || '-' }}</span>
        </template>
        <template #item.paid="{ item }">
          <span>{{ item.paid || '-' }}</span>
        </template>

        <!-- Attachments -->
        <template #item.attachments="{ item }">
          <div v-if="item.attachments.length" class="d-flex gap-1">
            <VIcon
              v-for="file in item.attachments"
              :key="file"
              icon="tabler-file"
              size="18"
              color="primary"
            />
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn icon="tabler-edit" variant="text" size="small" @click="openEdit(item)" />
            <VBtn icon="tabler-trash" variant="text" size="small" color="error" @click="deleteItem(item)" />
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Edit/Create Dialog -->
    <VDialog
      v-model="dialogVisible"
      max-width="800"
      scrollable
    >
      <VCard>
        <VCardTitle class="d-flex align-center pa-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="40"
            class="me-3"
          >
            <VIcon
              icon="tabler-circle-plus"
              size="24"
            />
          </VAvatar>
          <div>
            <h5 class="text-h5">
              {{ isEditing ? 'Edytuj Zadanie' : 'Nowe Zadanie' }}
            </h5>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ isEditing ? 'Zaktualizuj dane zadania' : 'Dodaj nowe zadanie do systemu' }}
            </p>
          </div>
          <VSpacer />
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="dialogVisible = false"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5" style="max-height: 600px;">

        <VForm @submit.prevent="saveItem">
          <VExpansionPanels v-model="expandedPanels" multiple>
            <!-- Section 1: Main info -->
            <VExpansionPanel value="0">
              <VExpansionPanelTitle>
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-info-circle" size="20" color="primary" />
                  <span>Informacje Glowne</span>
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <div class="mb-3">
                  <label class="text-sm font-weight-medium mb-2 d-block">Priorytet</label>
                  <VRadioGroup v-model="editedItem.priority" inline>
                    <VRadio
                      v-for="opt in priorityOptions"
                      :key="opt.value"
                      :label="opt.title"
                      :value="opt.value"
                      :color="taskPriorityColors[opt.value]"
                    />
                  </VRadioGroup>
                </div>

                <VSelect
                  v-model="editedItem.work_id"
                  :items="workOptions"
                  label="Rodzaj pracy"
                  class="mb-3"
                />

                <VDivider class="mb-4" />
                <div class="text-caption text-medium-emphasis mb-3">Lokalizacja</div>

                <VRow>
                  <VCol cols="6">
                    <VTextField v-model="editedItem.miasto" label="Miasto" />
                  </VCol>
                  <VCol cols="6">
                    <VTextField v-model="editedItem.obreb" label="Obreb" />
                  </VCol>
                </VRow>

                <VRow class="mt-1">
                  <VCol cols="6">
                    <VTextField v-model="editedItem.plot_no" label="Nr dzialki" />
                  </VCol>
                  <VCol cols="6">
                    <VTextField v-model="editedItem.ulica" label="Ulica" />
                  </VCol>
                </VRow>

                <VTextField
                  v-model="editedItem.reported"
                  label="Data zgloszenia"
                  type="date"
                  class="mb-3 mt-3"
                />

                <VTextField
                  v-model="editedItem.kodgik"
                  label="Kod GIK"
                  class="mb-3"
                />

                <VDivider class="mb-4" />
                <div class="text-caption text-medium-emphasis mb-3">Finanse</div>

                <VRow>
                  <VCol cols="4">
                    <VTextField
                      v-model.number="editedItem.net"
                      label="Netto (zl)"
                      type="number"
                      @update:model-value="calcGross"
                    />
                  </VCol>
                  <VCol cols="4">
                    <VTextField
                      v-model.number="editedItem.vat"
                      label="VAT (%)"
                      type="number"
                      @update:model-value="calcGross"
                    />
                  </VCol>
                  <VCol cols="4">
                    <VTextField
                      :model-value="editedItem.gross?.toFixed(2)"
                      label="Brutto (zl)"
                      readonly
                      variant="filled"
                    />
                  </VCol>
                </VRow>
              </VExpansionPanelText>
            </VExpansionPanel>

            <!-- Section 2: Client -->
            <VExpansionPanel value="1">
              <VExpansionPanelTitle>
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-user" size="20" color="primary" />
                  <span>Klient</span>
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <VSelect
                  v-model="editedItem.client_id"
                  :items="clientOptions"
                  label="Klient"
                />
              </VExpansionPanelText>
            </VExpansionPanel>

            <!-- Section 3: Additional info -->
            <VExpansionPanel value="2">
              <VExpansionPanelTitle>
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-notes" size="20" color="primary" />
                  <span>Informacje Dodatkowe</span>
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <VTextarea
                  v-model="editedItem.info"
                  label="Informacje dodatkowe"
                  rows="4"
                />
              </VExpansionPanelText>
            </VExpansionPanel>

            <!-- Section 4: Surveyor -->
            <VExpansionPanel value="3">
              <VExpansionPanelTitle>
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-map-pin" size="20" color="primary" />
                  <span>Geodeta</span>
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <div class="text-caption text-medium-emphasis mb-3">Pomiary</div>
                <VTextField
                  v-model="editedItem.measurements"
                  label="Data pomiarow"
                  type="date"
                  class="mb-3"
                />
                <VSelect
                  v-model="editedItem.measurements_surveyor_id"
                  :items="surveyorOptions"
                  label="Geodeta pomiary"
                  clearable
                  class="mb-3"
                />

                <VDivider class="mb-4" />
                <div class="text-caption text-medium-emphasis mb-3">Opracowanie</div>

                <VTextField
                  v-model="editedItem.study"
                  label="Data opracowania"
                  type="date"
                  class="mb-3"
                />
                <VSelect
                  v-model="editedItem.study_performer_id"
                  :items="surveyorOptions"
                  label="Wykonawca opracowania"
                  clearable
                  class="mb-3"
                />

                <VDivider class="mb-4" />

                <VTextField
                  v-model="editedItem.field"
                  label="Data terenowe"
                  type="date"
                />
              </VExpansionPanelText>
            </VExpansionPanel>

            <!-- Section 5: Finalization -->
            <VExpansionPanel value="4">
              <VExpansionPanelTitle>
                <div class="d-flex align-center gap-2">
                  <VIcon icon="tabler-checkbox" size="20" color="primary" />
                  <span>Finalizacja</span>
                </div>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <VTextField
                  v-model="editedItem.handed"
                  label="Data przekazania"
                  type="date"
                  class="mb-3"
                />
                <VTextField
                  v-model="editedItem.picked"
                  label="Data odbioru"
                  type="date"
                  class="mb-3"
                />
                <VTextField
                  v-model="editedItem.received"
                  label="Data otrzymania"
                  type="date"
                  class="mb-3"
                />
                <VTextField
                  v-model="editedItem.paid"
                  label="Data zaplaty"
                  type="date"
                />
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </VForm>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="dialogVisible = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="primary"
            @click="saveItem"
          >
            {{ isEditing ? 'Zapisz' : 'Dodaj' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss" scoped>
.tasks-table {
  :deep(tr:hover td) {
    background-color: rgba(var(--v-theme-primary), 0.04) !important;
  }

  :deep(tr) {
    transition: background-color 0.15s ease;
  }

  :deep(td) {
    padding-block: 12px !important;
  }
}
</style>
