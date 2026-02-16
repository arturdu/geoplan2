<script lang="ts" setup>
import { teams } from '@/data/mock'
import type { Team } from '@/types'

const router = useRouter()

const teamsList = ref<Team[]>([...teams])
const search = ref('')
const isDrawerOpen = ref(false)
const isEditing = ref(false)
const editingTeamId = ref<number | null>(null)
const snackbar = ref(false)
const snackbarMessage = ref('')

const formData = ref({
  name: '',
  website_url: '',
  company_address: '',
})

const formRef = ref()
const rules = {
  required: (v: string) => !!v || 'Pole wymagane',
}

const headers = [
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Strona WWW', key: 'website_url', sortable: false },
  { title: 'Adres', key: 'company_address', sortable: true },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Uzytkownicy', key: 'users_count', sortable: true },
  { title: 'Data utworzenia', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: '120px' },
]

const openCreateDrawer = () => {
  isEditing.value = false
  editingTeamId.value = null
  formData.value = {
    name: '',
    website_url: '',
    company_address: '',
  }
  isDrawerOpen.value = true
}

const openEditDrawer = (team: Team) => {
  isEditing.value = true
  editingTeamId.value = team.id
  formData.value = {
    name: team.name,
    website_url: team.website_url,
    company_address: team.company_address,
  }
  isDrawerOpen.value = true
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid)
    return

  if (isEditing.value && editingTeamId.value) {
    const index = teamsList.value.findIndex(t => t.id === editingTeamId.value)
    if (index !== -1) {
      teamsList.value[index] = {
        ...teamsList.value[index],
        name: formData.value.name,
        website_url: formData.value.website_url,
        company_address: formData.value.company_address,
      }
    }
    snackbarMessage.value = 'Zespol zostal zaktualizowany'
  }
  else {
    const newTeam: Team = {
      id: Math.max(...teamsList.value.map(t => t.id)) + 1,
      name: formData.value.name,
      short: formData.value.name.substring(0, 2).toUpperCase(),
      website_url: formData.value.website_url,
      company_address: formData.value.company_address,
      logo_url: null,
      orders_count: 0,
      users_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    }

    teamsList.value.push(newTeam)
    snackbarMessage.value = 'Zespol zostal dodany'
  }

  isDrawerOpen.value = false
  snackbar.value = true
}

const navigateToTeam = (team: Team) => {
  router.push(`/admin/teams/${team.id}`)
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between flex-wrap pa-5">
        <div class="d-flex align-center">
          <VIcon
            icon="tabler-users-group"
            class="me-2"
          />
          Zespoly Geodezyjne
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
            Nowy Zespol
          </VBtn>
        </div>
      </VCardTitle>
      <VDivider />

      <VDataTable
        :headers="headers"
        :items="teamsList"
        :search="search"
        :items-per-page="10"
        class="text-no-wrap"
        @click:row="(_e: any, { item }: any) => navigateToTeam(item)"
      >
        <template #item.name="{ item }">
          <span
            class="font-weight-bold text-primary cursor-pointer"
            @click.stop="navigateToTeam(item)"
          >
            {{ item.name }}
          </span>
        </template>

        <template #item.website_url="{ item }">
          <a
            :href="item.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-decoration-none"
            @click.stop
          >
            <VIcon
              icon="tabler-external-link"
              size="16"
              class="me-1"
            />
            {{ item.website_url }}
          </a>
        </template>

        <template #item.orders_count="{ item }">
          <VChip
            color="warning"
            size="small"
            label
          >
            {{ item.orders_count }}
          </VChip>
        </template>

        <template #item.users_count="{ item }">
          <VChip
            color="success"
            size="small"
            label
          >
            {{ item.users_count }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString('pl-PL') }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              size="small"
              @click.stop="navigateToTeam(item)"
            >
              <VIcon
                icon="tabler-eye"
                size="20"
              />
            </IconBtn>
            <IconBtn
              size="small"
              @click.stop="openEditDrawer(item)"
            >
              <VIcon
                icon="tabler-pencil"
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
          {{ isEditing ? 'Edytuj Zespol' : 'Nowy Zespol' }}
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
                v-model="formData.name"
                label="Nazwa zespolu"
                :rules="[rules.required]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formData.website_url"
                label="Strona WWW"
                prepend-inner-icon="tabler-world"
                placeholder="https://..."
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="formData.company_address"
                label="Adres firmy"
                :rules="[rules.required]"
              />
            </VCol>
            <VCol cols="12">
              <VBtn
                type="submit"
                color="error"
                block
              >
                {{ isEditing ? 'Zapisz zmiany' : 'Dodaj zespol' }}
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

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
