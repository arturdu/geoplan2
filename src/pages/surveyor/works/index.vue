<script lang="ts" setup>
import { workTypes } from '@/data/mock'
import type { WorkType } from '@/types'

// ── State ───────────────────────────────────────────────
const search = ref('')
const drawerVisible = ref(false)
const isEditing = ref(false)

const defaultItem: Partial<WorkType> = {
  name: '',
  description: '',
}

const editedItem = ref<Partial<WorkType>>({ ...defaultItem })
const tableItems = ref<WorkType[]>([...workTypes])

// ── Table headers ───────────────────────────────────────
const headers = [
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Opis', key: 'description', sortable: true },
  { title: 'Zadania', key: 'tasks_count', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false },
]

// ── Methods ─────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  drawerVisible.value = true
}

function openEdit(item: WorkType) {
  isEditing.value = true
  editedItem.value = { ...item }
  drawerVisible.value = true
}

function saveItem() {
  if (isEditing.value) {
    const idx = tableItems.value.findIndex(w => w.id === editedItem.value.id)
    if (idx !== -1) tableItems.value[idx] = { ...tableItems.value[idx], ...editedItem.value } as WorkType
  } else {
    const newId = Math.max(...tableItems.value.map(w => w.id)) + 1
    tableItems.value.push({
      ...defaultItem,
      ...editedItem.value,
      id: newId,
      tasks_count: 0,
    } as WorkType)
  }
  drawerVisible.value = false
}

function deleteItem(item: WorkType) {
  tableItems.value = tableItems.value.filter(w => w.id !== item.id)
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon
          icon="tabler-tool"
          size="24"
          class="me-2"
        />
        <span>Rodzaje Prac</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          label="Szukaj..."
          density="compact"
          variant="outlined"
          hide-details
          class="me-4"
          style="max-width: 300px"
        />
        <VBtn color="success" prepend-icon="tabler-plus" @click="openCreate">
          Nowy Rodzaj Pracy
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="tableItems"
        :search="search"
        :items-per-page="25"
        density="compact"
        hover
      >
        <!-- Name in blue bold -->
        <template #item.name="{ item }">
          <span class="font-weight-bold text-info">{{ item.name }}</span>
        </template>

        <!-- Tasks count badge -->
        <template #item.tasks_count="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.tasks_count }}
          </VChip>
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

    <!-- Edit/Create Drawer -->
    <VNavigationDrawer
      v-model="drawerVisible"
      temporary
      location="end"
      width="420"
    >
      <div class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <h6 class="text-h6">{{ isEditing ? 'Edytuj Rodzaj Pracy' : 'Nowy Rodzaj Pracy' }}</h6>
          <VBtn icon="tabler-x" variant="text" size="small" @click="drawerVisible = false" />
        </div>

        <VForm @submit.prevent="saveItem">
          <VTextField
            v-model="editedItem.name"
            label="Nazwa"
            class="mb-3"
          />

          <VTextarea
            v-model="editedItem.description"
            label="Opis"
            rows="4"
            class="mb-4"
          />

          <VBtn type="submit" color="success" block>
            {{ isEditing ? 'Zapisz zmiany' : 'Utworz' }}
          </VBtn>
        </VForm>
      </div>
    </VNavigationDrawer>
  </div>
</template>
