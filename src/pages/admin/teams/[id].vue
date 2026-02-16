<script lang="ts" setup>
import { teams, users } from '@/data/mock'
import type { Team, User } from '@/types'

const route = useRoute()
const router = useRouter()

const teamId = computed(() => Number((route.params as any).id))

const team = computed<Team | undefined>(() =>
  teams.find(t => t.id === teamId.value),
)

// All users in this team
const teamUsers = computed<User[]>(() =>
  users.filter(u => u.team_id === teamId.value),
)

// Team owners (users with 'team_owner' role)
const teamOwners = computed<User[]>(() =>
  teamUsers.value.filter(u => u.roles.includes('team_owner')),
)

const currentTab = ref(0)

const ownerHeaders = [
  { title: 'Imie i nazwisko', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Telefon', key: 'phone', sortable: false },
]

const userHeaders = [
  { title: 'Imie i nazwisko', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Typ', key: 'type', sortable: true },
  { title: 'Role', key: 'roles', sortable: false },
  { title: 'Aktywny', key: 'is_active', sortable: true },
]

const typeLabels: Record<string, string> = {
  surveyor: 'Geodeta',
  contractor: 'Wykonawca',
  inspector: 'Inspektor',
}

const typeColors: Record<string, string> = {
  surveyor: 'primary',
  contractor: 'warning',
  inspector: 'info',
}

const roleLabels: Record<string, string> = {
  surveyor: 'Geodeta',
  team_owner: 'Wlasciciel',
  contractor_admin: 'Admin wyk.',
  contractor_user: 'Uzytk. wyk.',
  inspector: 'Inspektor',
}

const goBack = () => {
  router.push('/admin/teams')
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <div class="mb-4">
      <VBtn
        variant="text"
        prepend-icon="tabler-arrow-left"
        @click="goBack"
      >
        Powrot do listy zespolow
      </VBtn>
    </div>

    <template v-if="team">
      <!-- Header Card -->
      <VCard class="mb-6">
        <VCardText class="d-flex align-center gap-4 pa-6">
          <VAvatar
            color="primary"
            variant="tonal"
            size="64"
            rounded
          >
            <VIcon
              icon="tabler-users-group"
              size="36"
            />
          </VAvatar>
          <div class="flex-grow-1">
            <h4 class="text-h4 mb-1">
              {{ team.name }}
            </h4>
            <div class="d-flex align-center gap-4 text-body-1 text-medium-emphasis">
              <span>
                <VIcon
                  icon="tabler-map-pin"
                  size="18"
                  class="me-1"
                />
                {{ team.company_address }}
              </span>
              <a
                :href="team.website_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-decoration-none"
              >
                <VIcon
                  icon="tabler-world"
                  size="18"
                  class="me-1"
                />
                {{ team.website_url }}
              </a>
            </div>
          </div>
          <div class="d-flex gap-4">
            <div class="text-center">
              <h5 class="text-h5">
                {{ team.orders_count }}
              </h5>
              <span class="text-body-2 text-medium-emphasis">Zlecenia</span>
            </div>
            <VDivider vertical />
            <div class="text-center">
              <h5 class="text-h5">
                {{ team.users_count }}
              </h5>
              <span class="text-body-2 text-medium-emphasis">Uzytkownicy</span>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Tabs -->
      <VCard>
        <VTabs
          v-model="currentTab"
          color="error"
        >
          <VTab :value="0">
            <VIcon
              icon="tabler-crown"
              class="me-2"
            />
            Wlasciciele
          </VTab>
          <VTab :value="1">
            <VIcon
              icon="tabler-users"
              class="me-2"
            />
            Uzytkownicy
          </VTab>
        </VTabs>
        <VDivider />

        <VWindow v-model="currentTab">
          <!-- Owners Tab -->
          <VWindowItem :value="0">
            <VDataTable
              :headers="ownerHeaders"
              :items="teamOwners"
              :items-per-page="10"
              class="text-no-wrap"
            >
              <template #item.full_name="{ item }">
                <div class="d-flex align-center gap-3 py-2">
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="34"
                  >
                    <span class="text-sm">{{ item.first_name[0] }}{{ item.last_name[0] }}</span>
                  </VAvatar>
                  <span class="font-weight-medium text-high-emphasis">
                    {{ item.full_name }}
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

              <template #no-data>
                <div class="text-center pa-4 text-medium-emphasis">
                  Brak wlascicieli w tym zespole
                </div>
              </template>
            </VDataTable>
          </VWindowItem>

          <!-- Users Tab -->
          <VWindowItem :value="1">
            <VDataTable
              :headers="userHeaders"
              :items="teamUsers"
              :items-per-page="10"
              class="text-no-wrap"
            >
              <template #item.full_name="{ item }">
                <div class="d-flex align-center gap-3 py-2">
                  <VAvatar
                    :color="typeColors[item.type] || 'primary'"
                    variant="tonal"
                    size="34"
                  >
                    <span class="text-sm">{{ item.first_name[0] }}{{ item.last_name[0] }}</span>
                  </VAvatar>
                  <span class="font-weight-medium text-high-emphasis">
                    {{ item.full_name }}
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

              <template #item.type="{ item }">
                <VChip
                  :color="typeColors[item.type] || 'secondary'"
                  size="small"
                  label
                >
                  {{ typeLabels[item.type] || item.type }}
                </VChip>
              </template>

              <template #item.roles="{ item }">
                <VChip
                  v-for="role in item.roles"
                  :key="role"
                  size="small"
                  variant="outlined"
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
            </VDataTable>
          </VWindowItem>
        </VWindow>
      </VCard>
    </template>

    <!-- Team not found -->
    <VCard v-else>
      <VCardText class="text-center pa-10">
        <VIcon
          icon="tabler-alert-triangle"
          size="64"
          color="warning"
          class="mb-4"
        />
        <h5 class="text-h5 mb-2">
          Zespol nie znaleziony
        </h5>
        <p class="text-body-1 text-medium-emphasis">
          Zespol o podanym ID nie istnieje.
        </p>
        <VBtn
          color="error"
          @click="goBack"
        >
          Powrot do listy
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>
