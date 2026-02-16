<script lang="ts" setup>
import { users, contractors, projects } from '@/data/mock'
import type { User, UserType } from '@/types'

// ── State ───────────────────────────────────────────────
const search = ref('')
const drawerVisible = ref(false)
const isEditing = ref(false)
const filterContractor = ref<number | null>(null)
const filterType = ref<UserType | null>(null)

const tableItems = ref<User[]>([...users])

// ── Defaults ────────────────────────────────────────────
const defaultItem: Partial<User> = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  type: 'surveyor',
  is_active: true,
  roles: [],
  contractor_id: null,
  project_ids: [],
}

const editedItem = ref<Partial<User>>({ ...defaultItem })

// ── Options ─────────────────────────────────────────────
const contractorOptions = contractors.map(c => ({ title: c.short, value: c.id }))
const projectOptions = projects.map(p => ({ title: p.name, value: p.id }))
const typeOptions: { title: string; value: UserType }[] = [
  { title: 'Geodeta', value: 'surveyor' },
  { title: 'Wykonawca', value: 'contractor' },
  { title: 'Inspektor', value: 'inspector' },
]
const roleOptions = ['surveyor', 'team_owner', 'contractor_admin', 'contractor_user', 'inspector']

// ── Color helpers ───────────────────────────────────────
function typeColor(type: UserType): string {
  if (type === 'surveyor') return 'success'
  if (type === 'contractor') return 'info'
  return 'error'
}

function typeLabel(type: UserType): string {
  if (type === 'surveyor') return 'Geodeta'
  if (type === 'contractor') return 'Wykonawca'
  return 'Inspektor'
}

// ── Filtered items ──────────────────────────────────────
const filteredItems = computed(() => {
  let items = tableItems.value
  if (filterContractor.value !== null) {
    items = items.filter(u => u.contractor_id === filterContractor.value)
  }
  if (filterType.value !== null) {
    items = items.filter(u => u.type === filterType.value)
  }
  return items
})

// ── Contractor short helper ─────────────────────────────
function contractorShort(contractorId: number | null): string {
  if (!contractorId) return '-'
  return contractors.find(c => c.id === contractorId)?.short || '-'
}

function projectNamesFromIds(ids: number[]): string[] {
  return ids.map(id => projects.find(p => p.id === id)?.name || `#${id}`)
}

// ── Table headers ───────────────────────────────────────
const headers = [
  { title: 'Imie i nazwisko', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Typ', key: 'type', sortable: true },
  { title: 'Wykonawca', key: 'contractor_id', sortable: true },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Aktywny', key: 'is_active', sortable: true },
  { title: 'Role', key: 'roles', sortable: false },
  { title: 'Kontrakty', key: 'project_ids', sortable: false },
  { title: 'Utworzono', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false },
]

// ── Methods ─────────────────────────────────────────────
function openCreate() {
  isEditing.value = false
  editedItem.value = { ...defaultItem }
  drawerVisible.value = true
}

function openEdit(item: User) {
  isEditing.value = true
  editedItem.value = { ...item, roles: [...item.roles], project_ids: [...item.project_ids] }
  drawerVisible.value = true
}

function saveItem() {
  if (isEditing.value) {
    const idx = tableItems.value.findIndex(u => u.id === editedItem.value.id)
    if (idx !== -1) {
      tableItems.value[idx] = {
        ...tableItems.value[idx],
        ...editedItem.value,
        full_name: `${editedItem.value.first_name} ${editedItem.value.last_name}`,
      } as User
    }
  } else {
    const newId = Math.max(...tableItems.value.map(u => u.id)) + 1
    tableItems.value.push({
      ...defaultItem,
      ...editedItem.value,
      id: newId,
      full_name: `${editedItem.value.first_name} ${editedItem.value.last_name}`,
      avatar_url: null,
      team_id: 1,
      orders_count: 0,
      created_at: new Date().toISOString().slice(0, 10),
    } as User)
  }
  drawerVisible.value = false
}

function toggleActive(item: User) {
  const idx = tableItems.value.findIndex(u => u.id === item.id)
  if (idx !== -1) tableItems.value[idx].is_active = !tableItems.value[idx].is_active
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center flex-wrap pa-4 gap-4">
        <VIcon
          icon="tabler-users"
          size="24"
          class="me-1"
        />
        <span>Uzytkownicy</span>
        <VSpacer />

        <VSelect
          v-model="filterContractor"
          :items="[{ title: 'Wszyscy wykonawcy', value: null }, ...contractorOptions]"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 200px"
          clearable
        />

        <VSelect
          v-model="filterType"
          :items="[{ title: 'Wszystkie typy', value: null }, ...typeOptions]"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 180px"
          clearable
        />

        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          label="Szukaj..."
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 250px"
        />

        <VBtn color="success" prepend-icon="tabler-plus" @click="openCreate">
          Nowy Uzytkownik
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="filteredItems"
        :search="search"
        :items-per-page="25"
        density="compact"
        hover
      >
        <!-- Full name with phone description + colored by type -->
        <template #item.full_name="{ item }">
          <div>
            <span class="font-weight-bold" :class="`text-${typeColor(item.type)}`">
              {{ item.full_name }}
            </span>
            <div class="text-xs text-medium-emphasis">{{ item.phone }}</div>
          </div>
        </template>

        <!-- Email with mailto link -->
        <template #item.email="{ item }">
          <a :href="`mailto:${item.email}`" class="text-decoration-none d-flex align-center gap-1">
            <VIcon icon="tabler-mail" size="14" />
            {{ item.email }}
          </a>
        </template>

        <!-- Type badge -->
        <template #item.type="{ item }">
          <VChip size="small" :color="typeColor(item.type)" variant="tonal">
            {{ typeLabel(item.type) }}
          </VChip>
        </template>

        <!-- Contractor short -->
        <template #item.contractor_id="{ item }">
          {{ contractorShort(item.contractor_id) }}
        </template>

        <!-- Orders count badge -->
        <template #item.orders_count="{ item }">
          <VChip size="small" color="primary" variant="tonal">
            {{ item.orders_count }}
          </VChip>
        </template>

        <!-- Active toggle -->
        <template #item.is_active="{ item }">
          <VSwitch
            :model-value="item.is_active"
            color="success"
            density="compact"
            hide-details
            @update:model-value="toggleActive(item)"
          />
        </template>

        <!-- Roles -->
        <template #item.roles="{ item }">
          <ul class="ps-4 my-1 text-medium-emphasis" style="list-style-type: disc">
            <li v-for="role in item.roles" :key="role" class="text-xs">{{ role }}</li>
          </ul>
        </template>

        <!-- Projects -->
        <template #item.project_ids="{ item }">
          <ul class="ps-4 my-1 text-medium-emphasis" style="list-style-type: disc">
            <li v-for="pname in projectNamesFromIds(item.project_ids)" :key="pname" class="text-xs">
              {{ pname }}
            </li>
          </ul>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <VBtn icon="tabler-edit" variant="text" size="small" @click="openEdit(item)" />
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
          <h6 class="text-h6">{{ isEditing ? 'Edytuj Uzytkownika' : 'Nowy Uzytkownik' }}</h6>
          <VBtn icon="tabler-x" variant="text" size="small" @click="drawerVisible = false" />
        </div>

        <VForm @submit.prevent="saveItem">
          <!-- User type - only on create -->
          <div v-if="!isEditing" class="mb-4">
            <label class="text-sm font-weight-medium mb-2 d-block">Typ uzytkownika</label>
            <VRadioGroup v-model="editedItem.type" inline>
              <VRadio label="Geodeta" value="surveyor" color="success" />
              <VRadio label="Wykonawca" value="contractor" color="info" />
              <VRadio label="Inspektor" value="inspector" color="error" />
            </VRadioGroup>
          </div>

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

          <VSelect
            v-model="editedItem.roles"
            :items="roleOptions"
            label="Role"
            multiple
            chips
            closable-chips
            class="mb-3"
          />

          <!-- Contractor select - visible for contractor type only -->
          <VSelect
            v-if="editedItem.type === 'contractor'"
            v-model="editedItem.contractor_id"
            :items="contractorOptions"
            label="Wykonawca"
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
