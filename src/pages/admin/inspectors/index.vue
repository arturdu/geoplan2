<script lang="ts" setup>
import { projects, teams, users } from '@/data/mock'
import type { User } from '@/types'

// All inspectors
const inspectors = ref<User[]>(
  users.filter(u => u.type === 'inspector'),
)

const search = ref('')
const isDrawerOpen = ref(false)
const isEditing = ref(false)
const editingInspectorId = ref<number | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  team_ids: [] as number[],
})

const formRef = ref()
const rules = {
  required: (v: string) => !!v || 'Pole wymagane',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Nieprawidlowy adres email',
}

const teamOptions = computed(() =>
  teams.map(t => ({ title: t.name, value: t.id })),
)

const headers = [
  { title: 'Imie i nazwisko', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Zespoly', key: 'teams', sortable: false },
  { title: 'Projekty', key: 'projects', sortable: false },
  { title: 'Data utworzenia', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: '100px' },
]

// Get team name by id
const getTeamName = (teamId: number) => {
  const team = teams.find(t => t.id === teamId)

  return team?.name || '-'
}

// Get project names for inspector
const getInspectorProjects = (inspector: User) => {
  return projects
    .filter(p => p.inspector_ids.includes(inspector.id))
    .map(p => p.name)
}

// Get team names for an inspector (from their team_id)
const getInspectorTeams = (inspector: User) => {
  const teamName = getTeamName(inspector.team_id)

  return teamName !== '-' ? [teamName] : []
}

const openCreateDrawer = () => {
  isEditing.value = false
  editingInspectorId.value = null
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    team_ids: [],
  }
  isDrawerOpen.value = true
}

const openEditDrawer = (inspector: User) => {
  isEditing.value = true
  editingInspectorId.value = inspector.id
  formData.value = {
    first_name: inspector.first_name,
    last_name: inspector.last_name,
    email: inspector.email,
    phone: inspector.phone,
    team_ids: [inspector.team_id],
  }
  isDrawerOpen.value = true
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid)
    return

  if (isEditing.value && editingInspectorId.value) {
    const index = inspectors.value.findIndex(u => u.id === editingInspectorId.value)
    if (index !== -1) {
      inspectors.value[index] = {
        ...inspectors.value[index],
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        full_name: `${formData.value.first_name} ${formData.value.last_name}`,
        email: formData.value.email,
        phone: formData.value.phone,
        team_id: formData.value.team_ids[0] || inspectors.value[index].team_id,
      }
    }
    snackbarMessage.value = 'Inspektor zostal zaktualizowany'
  }
  else {
    const newInspector: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      full_name: `${formData.value.first_name} ${formData.value.last_name}`,
      email: formData.value.email,
      phone: formData.value.phone,
      type: 'inspector',
      avatar_url: null,
      is_active: true,
      roles: ['inspector'],
      contractor_id: null,
      project_ids: [],
      team_id: formData.value.team_ids[0] || 1,
      orders_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    }

    inspectors.value.push(newInspector)
    snackbarMessage.value = 'Inspektor zostal dodany'
  }

  isDrawerOpen.value = false
  snackbar.value = true
}

const deleteInspector = (inspector: User) => {
  const index = inspectors.value.findIndex(u => u.id === inspector.id)
  if (index !== -1) {
    inspectors.value.splice(index, 1)
    snackbarMessage.value = 'Inspektor zostal usuniety'
    snackbar.value = true
  }
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap pa-5">
        <div class="d-flex align-center">
          <VIcon
            icon="tabler-shield-check"
            class="me-2"
          />
          Inspektorzy
        </div>
        <div class="d-flex align-center gap-4">
          <AppTextField
            v-model="search"
            placeholder="Szukaj..."
            prepend-inner-icon="tabler-search"
            style="min-inline-size: 200px;"
          />
          <VBtn
            color="error"
            prepend-icon="tabler-plus"
            @click="openCreateDrawer"
          >
            Nowy Inspektor
          </VBtn>
        </div>
      </VCardTitle>
      <VDivider />

      <VDataTable
        :headers="headers"
        :items="inspectors"
        :search="search"
        :items-per-page="10"
        class="text-no-wrap"
      >
        <template #item.full_name="{ item }">
          <div class="py-2">
            <span class="font-weight-bold text-high-emphasis d-block">
              {{ item.full_name }}
            </span>
            <span class="text-body-2 text-medium-emphasis">
              {{ item.phone }}
            </span>
          </div>
        </template>

        <template #item.email="{ item }">
          <a
            :href="`mailto:${item.email}`"
            class="text-decoration-none"
          >
            {{ item.email }}
          </a>
        </template>

        <template #item.teams="{ item }">
          <div>
            <div
              v-for="teamName in getInspectorTeams(item)"
              :key="teamName"
              class="d-flex align-center gap-1 mb-1"
            >
              <VIcon
                icon="tabler-point-filled"
                size="12"
                color="info"
              />
              <span class="text-info text-body-2">{{ teamName }}</span>
            </div>
            <span
              v-if="getInspectorTeams(item).length === 0"
              class="text-disabled"
            >
              -
            </span>
          </div>
        </template>

        <template #item.projects="{ item }">
          <div>
            <div
              v-for="projectName in getInspectorProjects(item)"
              :key="projectName"
              class="d-flex align-center gap-1 mb-1"
            >
              <VIcon
                icon="tabler-point-filled"
                size="12"
                color="error"
              />
              <span class="text-error text-body-2">{{ projectName }}</span>
            </div>
            <span
              v-if="getInspectorProjects(item).length === 0"
              class="text-disabled"
            >
              -
            </span>
          </div>
        </template>

        <template #item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString('pl-PL') }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              size="small"
              @click="openEditDrawer(item)"
            >
              <VIcon
                icon="tabler-pencil"
                size="20"
              />
            </IconBtn>
            <IconBtn
              size="small"
              color="error"
              @click="deleteInspector(item)"
            >
              <VIcon
                icon="tabler-trash"
                size="20"
              />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Drawer -->
    <VNavigationDrawer
      v-model="isDrawerOpen"
      temporary
      location="end"
      width="400"
    >
      <div class="d-flex align-center pa-5">
        <h5 class="text-h5">
          {{ isEditing ? 'Edytuj Inspektora' : 'Nowy Inspektor' }}
        </h5>
        <VSpacer />
        <IconBtn @click="isDrawerOpen = false">
          <VIcon icon="tabler-x" />
        </IconBtn>
      </div>
      <VDivider />

      <VCardText>
        <VForm
          ref="formRef"
          @submit.prevent="handleSubmit"
        >
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="formData.first_name"
                label="Imie"
                :rules="[rules.required]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formData.last_name"
                label="Nazwisko"
                :rules="[rules.required]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formData.email"
                label="Email"
                type="email"
                :rules="[rules.required, rules.email]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formData.phone"
                label="Telefon"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="formData.team_ids"
                :items="teamOptions"
                label="Zespoly"
                multiple
                chips
                closable-chips
              />
            </VCol>
            <VCol cols="12">
              <VBtn
                type="submit"
                color="error"
                block
              >
                {{ isEditing ? 'Zapisz zmiany' : 'Dodaj inspektora' }}
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VNavigationDrawer>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar"
      color="success"
      :timeout="3000"
    >
      {{ snackbarMessage }}
    </VSnackbar>
  </div>
</template>
