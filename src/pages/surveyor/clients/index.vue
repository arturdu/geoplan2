<script lang="ts" setup>
import { clients } from '@/data/mock'
import type { Client } from '@/types'

// ── State ───────────────────────────────────────────────
const search = ref('')
const drawerVisible = ref(false)
const isEditing = ref(false)

const defaultItem: Partial<Client> = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  nip: '',
}

const editedItem = ref<Partial<Client>>({ ...defaultItem })
const tableItems = ref<Client[]>([...clients])

// ── Table headers ───────────────────────────────────────
const headers = [
  { title: 'Imie i nazwisko', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Adres', key: 'address', sortable: true },
  { title: 'Firma / NIP', key: 'company', sortable: true },
  { title: 'Zadania', key: 'tasks_count', sortable: true },
  { title: 'Utworzono', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false },
]

// ── Methods ─────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  drawerVisible.value = true
}

function openEdit(item: Client) {
  isEditing.value = true
  editedItem.value = { ...item }
  drawerVisible.value = true
}

function saveItem() {
  if (isEditing.value) {
    const idx = tableItems.value.findIndex(c => c.id === editedItem.value.id)
    if (idx !== -1) {
      tableItems.value[idx] = {
        ...tableItems.value[idx],
        ...editedItem.value,
        full_name: `${editedItem.value.first_name} ${editedItem.value.last_name}`,
      } as Client
    }
  } else {
    const newId = Math.max(...tableItems.value.map(c => c.id)) + 1
    tableItems.value.push({
      ...defaultItem,
      ...editedItem.value,
      id: newId,
      full_name: `${editedItem.value.first_name} ${editedItem.value.last_name}`,
      tasks_count: 0,
      created_at: new Date().toISOString().slice(0, 10),
    } as Client)
  }
  drawerVisible.value = false
}

function deleteItem(item: Client) {
  tableItems.value = tableItems.value.filter(c => c.id !== item.id)
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon
          icon="tabler-address-book"
          size="24"
          class="me-2"
        />
        <span>Klienci</span>
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
          Nowy Klient
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
        <!-- Full name with phone -->
        <template #item.full_name="{ item }">
          <div>
            <span class="font-weight-bold text-info">{{ item.full_name }}</span>
            <div class="text-xs text-medium-emphasis">{{ item.phone }}</div>
          </div>
        </template>

        <!-- Email with mailto -->
        <template #item.email="{ item }">
          <a :href="`mailto:${item.email}`" class="text-decoration-none d-flex align-center gap-1">
            <VIcon icon="tabler-mail" size="14" />
            {{ item.email }}
          </a>
        </template>

        <!-- Company / NIP -->
        <template #item.company="{ item }">
          <div v-if="item.company">
            <div>{{ item.company }}</div>
            <div v-if="item.nip" class="text-xs text-medium-emphasis">NIP: {{ item.nip }}</div>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
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
          <h6 class="text-h6">{{ isEditing ? 'Edytuj Klienta' : 'Nowy Klient' }}</h6>
          <VBtn icon="tabler-x" variant="text" size="small" @click="drawerVisible = false" />
        </div>

        <VForm @submit.prevent="saveItem">
          <VTextField
            v-model="editedItem.first_name"
            label="Imie"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.last_name"
            label="Nazwisko"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.email"
            label="Email"
            type="email"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.phone"
            label="Telefon"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.address"
            label="Adres"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.company"
            label="Firma"
            class="mb-3"
          />

          <VTextField
            v-model="editedItem.nip"
            label="NIP"
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
