<script lang="ts" setup>
import { contractors, projects } from '@/data/mock'
import type { Contractor } from '@/types'

// ── State ───────────────────────────────────────────────
const search = ref('')
const drawerVisible = ref(false)
const isEditing = ref(false)

const defaultItem: Partial<Contractor> = {
  name: '',
  short: '',
  info: '',
  project_ids: [],
}

const editedItem = ref<Partial<Contractor>>({ ...defaultItem })
const tableItems = ref<Contractor[]>([...contractors])

// ── Helpers ─────────────────────────────────────────────
function projectNames(projectIds: number[]): string[] {
  return projectIds.map(pid => projects.find(p => p.id === pid)?.name || `#${pid}`)
}

const projectOptions = projects.map(p => ({ title: p.name, value: p.id }))

// ── Table headers ───────────────────────────────────────
const headers = [
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Skrot', key: 'short', sortable: true },
  { title: 'Kontrakty', key: 'project_ids', sortable: false },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Uzytkownicy', key: 'users_count', sortable: true },
  { title: 'Utworzono', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false },
]

// ── Methods ─────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  drawerVisible.value = true
}

function openEdit(item: Contractor) {
  isEditing.value = true
  editedItem.value = { ...item }
  drawerVisible.value = true
}

function saveItem() {
  if (isEditing.value) {
    const idx = tableItems.value.findIndex(c => c.id === editedItem.value.id)
    if (idx !== -1) tableItems.value[idx] = { ...tableItems.value[idx], ...editedItem.value } as Contractor
  } else {
    const newId = Math.max(...tableItems.value.map(c => c.id)) + 1
    tableItems.value.push({
      ...defaultItem,
      ...editedItem.value,
      id: newId,
      orders_count: 0,
      users_count: 0,
      team_id: 1,
      created_at: new Date().toISOString().slice(0, 10),
    } as Contractor)
  }
  drawerVisible.value = false
}

function deleteItem(item: Contractor) {
  tableItems.value = tableItems.value.filter(c => c.id !== item.id)
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon
          icon="tabler-users-group"
          size="24"
          class="me-2"
        />
        <span>Wykonawcy</span>
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
          Nowy Wykonawca
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
        <!-- Name + info description -->
        <template #item.name="{ item }">
          <div>
            <span class="font-weight-bold text-info">{{ item.name }}</span>
            <div class="text-xs text-medium-emphasis">{{ item.info }}</div>
          </div>
        </template>

        <!-- Projects as bulleted list -->
        <template #item.project_ids="{ item }">
          <ul class="ps-4 my-1" style="list-style-type: disc">
            <li v-for="pname in projectNames(item.project_ids)" :key="pname" class="text-xs">
              {{ pname }}
            </li>
          </ul>
        </template>

        <!-- Orders count badge -->
        <template #item.orders_count="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.orders_count }}
          </VChip>
        </template>

        <!-- Users count badge -->
        <template #item.users_count="{ item }">
          <VChip size="small" color="info" variant="tonal">
            {{ item.users_count }}
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
          <h6 class="text-h6">{{ isEditing ? 'Edytuj Wykonawce' : 'Nowy Wykonawca' }}</h6>
          <VBtn icon="tabler-x" variant="text" size="small" @click="drawerVisible = false" />
        </div>

        <VForm @submit.prevent="saveItem">
          <VTextField
            v-model="editedItem.name"
            label="Nazwa"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.short"
            label="Skrot"
            class="mb-3"
          />

          <VTextarea
            v-model="editedItem.info"
            label="Informacje"
            rows="3"
            class="mb-3"
          />

          <VSelect
            v-model="editedItem.project_ids"
            :items="projectOptions"
            label="Kontrakty"
            multiple
            chips
            closable-chips
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
