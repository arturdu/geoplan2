<script lang="ts" setup>
import { asgroups as mockAsgroups, projects } from '@/data/mock'
import type { Asgroup } from '@/types'

const search = ref('')
const drawerVisible = ref(false)
const editingAsgroup = ref<Asgroup | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const asgroupToDelete = ref<Asgroup | null>(null)
const selected = ref<Asgroup[]>([])

const asgroupList = ref<Asgroup[]>(mockAsgroups.map(a => ({
  ...a,
  project: projects.find(p => p.id === a.project_id),
})))

const asgroupIconOptions = [
  { icon: 'tabler-road', label: 'Droga' },
  { icon: 'tabler-layers-intersect', label: 'Warstwy' },
  { icon: 'tabler-wall', label: 'Mur' },
  { icon: 'tabler-fence', label: 'Ogrodzenie' },
  { icon: 'tabler-pipe', label: 'Rura' },
  { icon: 'tabler-traffic-cone', label: 'Roboty drogowe' },
  { icon: 'tabler-barrier-block', label: 'Bariera' },
  { icon: 'tabler-trees', label: 'Zielen' },
  { icon: 'tabler-antenna-bars-5', label: 'Siec' },
]

const headers = [
  { title: 'Ikona', key: 'icon', sortable: false, width: 70 },
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Projekt', key: 'project.name', sortable: true },
  { title: 'Definicja', key: 'definition', sortable: true },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: 120 },
]

const filteredAsgroups = computed(() => {
  return asgroupList.value.filter(ag => {
    const matchesSearch = !search.value
      || ag.name.toLowerCase().includes(search.value.toLowerCase())
      || ag.definition.toLowerCase().includes(search.value.toLowerCase())

    return matchesSearch
  })
})

// Form state
const formName = ref('')
const formDefinition = ref('')
const formIcon = ref('tabler-road')
const formValid = ref(false)

const nameRules = [(v: string) => !!v || 'Nazwa jest wymagana']

function openEditDrawer(asgroup: Asgroup) {
  editingAsgroup.value = asgroup
  formName.value = asgroup.name
  formDefinition.value = asgroup.definition
  formIcon.value = asgroup.icon || 'tabler-road'
  drawerVisible.value = true
}

function submitForm() {
  if (!formName.value) return

  if (editingAsgroup.value) {
    const idx = asgroupList.value.findIndex(a => a.id === editingAsgroup.value!.id)
    if (idx !== -1) {
      asgroupList.value[idx] = {
        ...asgroupList.value[idx],
        name: formName.value,
        definition: formDefinition.value,
        icon: formIcon.value,
      }
    }
    snackbarText.value = 'Grupa asortymentowa zaktualizowana pomyslnie'
  }

  drawerVisible.value = false
  snackbar.value = true
}

function confirmDelete(asgroup: Asgroup) {
  asgroupToDelete.value = asgroup
  deleteDialog.value = true
}

function deleteAsgroup() {
  if (asgroupToDelete.value) {
    asgroupList.value = asgroupList.value.filter(a => a.id !== asgroupToDelete.value!.id)
    snackbarText.value = 'Grupa asortymentowa usunieta'
    snackbar.value = true
  }
  deleteDialog.value = false
  asgroupToDelete.value = null
}

function mergeSelected() {
  if (selected.value.length < 2) {
    snackbarText.value = 'Zaznacz co najmniej 2 grupy do polaczenia'
    snackbar.value = true
    return
  }
  const names = selected.value.map(a => a.name).join(', ')
  snackbarText.value = `Polaczono grupy: ${names}`
  snackbar.value = true
  selected.value = []
}

function truncate(text: string, length: number = 50): string {
  return text.length > length ? `${text.substring(0, length)}...` : text
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-layers-intersect"
          size="28"
          class="me-1"
        />
        <span class="text-h5">Grupy Asortymentowe</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj grup..."
          density="compact"
          hide-details
          style="max-inline-size: 280px;"
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
          prepend-icon="tabler-arrows-join"
          :disabled="selected.length < 2"
          @click="mergeSelected"
        >
          Polacz Wybrane Grupy
        </VBtn>
      </div>

      <VDataTable
        v-model="selected"
        :headers="headers"
        :items="filteredAsgroups"
        :search="search"
        :items-per-page="10"
        show-select
        return-object
        hover
        class="asgroups-table"
      >
        <template #item.icon="{ item }">
          <VIcon
            :icon="item.icon || 'tabler-layers-intersect'"
            size="22"
            color="primary"
          />
        </template>

        <template #item.name="{ item }">
          <span class="font-weight-bold text-primary">{{ item.name }}</span>
        </template>

        <template #item.project.name="{ item }">
          {{ item.project?.name }}
        </template>

        <template #item.definition="{ item }">
          <span class="text-medium-emphasis">{{ truncate(item.definition) }}</span>
        </template>

        <template #item.orders_count="{ item }">
          <VChip
            :color="item.orders_count > 0 ? 'primary' : 'secondary'"
            size="small"
            label
          >
            {{ item.orders_count }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VTooltip location="top">
            <template #activator="{ props: tp }">
              <VBtn
                v-bind="tp"
                icon="tabler-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="openEditDrawer(item)"
              />
            </template>
            Edytuj
          </VTooltip>
          <VTooltip location="top">
            <template #activator="{ props: tp }">
              <VBtn
                v-bind="tp"
                icon="tabler-trash"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
              />
            </template>
            Usun
          </VTooltip>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <VIcon
              icon="tabler-database-off"
              size="48"
              color="disabled"
              class="mb-4"
            />
            <p class="text-h6 text-medium-emphasis mb-1">
              Brak grup asortymentowych
            </p>
            <p class="text-body-2 text-disabled mb-0">
              Nie znaleziono zadnych grup asortymentowych.
            </p>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Edit Drawer -->
    <VNavigationDrawer
      v-model="drawerVisible"
      location="end"
      temporary
      width="420"
    >
      <div class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
          <h5 class="text-h5">
            <VIcon
              icon="tabler-pencil"
              size="24"
              class="me-2"
            />
            Edytuj Grupe
          </h5>
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="drawerVisible = false"
          />
        </div>

        <VForm
          v-model="formValid"
          @submit.prevent="submitForm"
        >
          <VTextField
            v-model="formName"
            label="Nazwa"
            prepend-inner-icon="tabler-tag"
            :rules="nameRules"
            class="mb-4"
          />

          <VTextarea
            v-model="formDefinition"
            label="Definicja"
            prepend-inner-icon="tabler-file-description"
            rows="4"
            class="mb-4"
          />

          <!-- Icon Picker -->
          <div class="mb-6">
            <label class="text-body-2 font-weight-medium text-medium-emphasis d-flex align-center gap-1 mb-2">
              <VIcon
                icon="tabler-icons"
                size="16"
              />
              Ikona
            </label>
            <div class="d-flex flex-wrap gap-2">
              <VTooltip
                v-for="opt in asgroupIconOptions"
                :key="opt.icon"
                location="top"
              >
                <template #activator="{ props: tp }">
                  <VBtn
                    v-bind="tp"
                    :icon="opt.icon"
                    :variant="formIcon === opt.icon ? 'flat' : 'tonal'"
                    :color="formIcon === opt.icon ? 'primary' : 'default'"
                    size="small"
                    class="icon-picker-btn"
                  />
                </template>
                {{ opt.label }}
              </VTooltip>
            </div>
          </div>

          <VBtn
            type="submit"
            color="primary"
            block
            :disabled="!formValid"
            prepend-icon="tabler-device-floppy"
          >
            Zapisz Zmiany
          </VBtn>
        </VForm>
      </div>
    </VNavigationDrawer>

    <!-- Delete Dialog -->
    <VDialog
      v-model="deleteDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon
            icon="tabler-alert-triangle"
            color="error"
          />
          Potwierdzenie usuwania
        </VCardTitle>
        <VCardText>Czy na pewno chcesz usunac grupe "{{ asgroupToDelete?.name }}"?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            prepend-icon="tabler-x"
            @click="deleteDialog = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="error"
            prepend-icon="tabler-trash"
            @click="deleteAsgroup"
          >
            Usun
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Snackbar -->
    <VSnackbar
      v-model="snackbar"
      color="success"
      :timeout="3000"
    >
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style lang="scss" scoped>
.asgroups-table {
  :deep(tbody tr) {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.04) !important;
    }
  }
}

.icon-picker-btn {
  border: 2px solid transparent;
  transition: all 0.15s ease;
}
</style>
