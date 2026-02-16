<script lang="ts" setup>
import { contractors, users } from '@/data/mock'
import type { User } from '@/types'

// Current contractor (mock: first contractor)
const currentContractor = contractors[0]

// Users for current contractor
const contractorUsers = ref<User[]>(
  users.filter(u => u.contractor_id === currentContractor.id),
)

const search = ref('')
const isDrawerOpen = ref(false)
const isEditing = ref(false)
const editingUserId = ref<number | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')

// Form data
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  roles: [] as string[],
})

const availableRoles = [
  { title: 'Administrator', value: 'contractor_admin' },
  { title: 'Uzytkownik', value: 'contractor_user' },
]

const headers = [
  { title: 'Imie i nazwisko', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Telefon', key: 'phone', sortable: false },
  { title: 'Role', key: 'roles', sortable: false },
  { title: 'Aktywny', key: 'is_active', sortable: true },
  { title: 'Data utworzenia', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: '100px' },
]

// Form validation
const formRef = ref()
const rules = {
  required: (v: string) => !!v || 'Pole wymagane',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Nieprawidlowy adres email',
  roles: (v: string[]) => v.length > 0 || 'Wybierz przynajmniej jedna role',
}

const roleLabels: Record<string, string> = {
  contractor_admin: 'Administrator',
  contractor_user: 'Uzytkownik',
}

const roleColors: Record<string, string> = {
  contractor_admin: 'warning',
  contractor_user: 'info',
}

const openCreateDrawer = () => {
  isEditing.value = false
  editingUserId.value = null
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    roles: [],
  }
  isDrawerOpen.value = true
}

const openEditDrawer = (user: User) => {
  isEditing.value = true
  editingUserId.value = user.id
  formData.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    roles: [...user.roles],
  }
  isDrawerOpen.value = true
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid)
    return

  if (isEditing.value && editingUserId.value) {
    const index = contractorUsers.value.findIndex(u => u.id === editingUserId.value)
    if (index !== -1) {
      contractorUsers.value[index] = {
        ...contractorUsers.value[index],
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        full_name: `${formData.value.first_name} ${formData.value.last_name}`,
        email: formData.value.email,
        phone: formData.value.phone,
        roles: formData.value.roles,
      }
    }
    snackbarMessage.value = 'Uzytkownik zostal zaktualizowany'
  }
  else {
    const newUser: User = {
      id: Math.max(...contractorUsers.value.map(u => u.id)) + 1,
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      full_name: `${formData.value.first_name} ${formData.value.last_name}`,
      email: formData.value.email,
      phone: formData.value.phone,
      type: 'contractor',
      avatar_url: null,
      is_active: true,
      roles: formData.value.roles,
      contractor_id: currentContractor.id,
      project_ids: [],
      team_id: currentContractor.team_id,
      orders_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    }

    contractorUsers.value.push(newUser)
    snackbarMessage.value = 'Uzytkownik zostal dodany'
  }

  isDrawerOpen.value = false
  snackbar.value = true
}

const deleteUser = (user: User) => {
  const index = contractorUsers.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    contractorUsers.value.splice(index, 1)
    snackbarMessage.value = 'Uzytkownik zostal usuniety'
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
            icon="tabler-users"
            class="me-2"
          />
          Uzytkownicy - {{ currentContractor.name }}
        </div>
        <div class="d-flex align-center gap-4">
          <AppTextField
            v-model="search"
            placeholder="Szukaj..."
            prepend-inner-icon="tabler-search"
            style="min-inline-size: 200px;"
          />
          <VBtn
            color="warning"
            prepend-icon="tabler-plus"
            @click="openCreateDrawer"
          >
            Nowy Uzytkownik
          </VBtn>
        </div>
      </VCardTitle>
      <VDivider />

      <VDataTable
        :headers="headers"
        :items="contractorUsers"
        :search="search"
        :items-per-page="10"
        class="text-no-wrap"
      >
        <template #item.full_name="{ item }">
          <span class="font-weight-bold text-primary">
            {{ item.full_name }}
          </span>
        </template>

        <template #item.email="{ item }">
          <a
            :href="`mailto:${item.email}`"
            class="text-decoration-none"
          >
            {{ item.email }}
          </a>
        </template>

        <template #item.roles="{ item }">
          <VChip
            v-for="role in item.roles"
            :key="role"
            :color="roleColors[role] || 'secondary'"
            size="small"
            label
            class="me-1"
          >
            {{ roleLabels[role] || role }}
          </VChip>
        </template>

        <template #item.is_active="{ item }">
          <VIcon
            :icon="item.is_active ? 'tabler-circle-check-filled' : 'tabler-circle-x-filled'"
            :color="item.is_active ? 'success' : 'error'"
            size="22"
          />
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
              @click="deleteUser(item)"
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
          {{ isEditing ? 'Edytuj Uzytkownika' : 'Nowy Uzytkownik' }}
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
                v-model="formData.roles"
                :items="availableRoles"
                label="Role"
                multiple
                chips
                closable-chips
                :rules="[rules.roles]"
              />
            </VCol>
            <VCol cols="12">
              <VBtn
                type="submit"
                color="warning"
                block
              >
                {{ isEditing ? 'Zapisz zmiany' : 'Dodaj uzytkownika' }}
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
