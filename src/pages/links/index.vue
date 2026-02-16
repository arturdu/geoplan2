<script lang="ts" setup>
import { projectLinks as mockLinks, projects } from '@/data/mock'
import type { ProjectLink } from '@/types'

const search = ref('')
const projectFilter = ref<number | null>(null)
const drawerVisible = ref(false)
const editingLink = ref<ProjectLink | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const linkToDelete = ref<ProjectLink | null>(null)

const linkList = ref<ProjectLink[]>([...mockLinks])

const projectOptions = projects.map(p => ({ title: p.name, value: p.id }))

const headers = [
  { title: 'Projekt', key: 'project.name', sortable: true },
  { title: 'Link', key: 'url', sortable: true },
  { title: 'Dodal', key: 'user.full_name', sortable: true },
  { title: 'Data dodania', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: 120 },
]

const filteredLinks = computed(() => {
  return linkList.value.filter(link => {
    const matchesSearch = !search.value
      || link.url.toLowerCase().includes(search.value.toLowerCase())
      || link.description.toLowerCase().includes(search.value.toLowerCase())
      || link.project?.name.toLowerCase().includes(search.value.toLowerCase())

    const matchesProject = !projectFilter.value || link.project_id === projectFilter.value

    return matchesSearch && matchesProject
  })
})

// Form state
const formProject = ref<number | null>(null)
const formUrl = ref('')
const formDescription = ref('')
const formValid = ref(false)

const projectRules = [(v: number | null) => !!v || 'Projekt jest wymagany']
const urlRules = [
  (v: string) => !!v || 'URL jest wymagany',
  (v: string) => /^https?:\/\/.+/.test(v) || 'Podaj prawidlowy URL',
]

function openCreateDrawer() {
  editingLink.value = null
  formProject.value = null
  formUrl.value = ''
  formDescription.value = ''
  drawerVisible.value = true
}

function openEditDrawer(link: ProjectLink) {
  editingLink.value = link
  formProject.value = link.project_id
  formUrl.value = link.url
  formDescription.value = link.description
  drawerVisible.value = true
}

function submitForm() {
  if (!formProject.value || !formUrl.value) return

  if (editingLink.value) {
    const idx = linkList.value.findIndex(l => l.id === editingLink.value!.id)
    if (idx !== -1) {
      const project = projects.find(p => p.id === formProject.value)

      linkList.value[idx] = {
        ...linkList.value[idx],
        project_id: formProject.value,
        project,
        url: formUrl.value,
        description: formDescription.value,
      }
    }
    snackbarText.value = 'Link zaktualizowany pomyslnie'
  }
  else {
    const project = projects.find(p => p.id === formProject.value)

    const newLink: ProjectLink = {
      id: Date.now(),
      project_id: formProject.value,
      project,
      url: formUrl.value,
      description: formDescription.value,
      user: { full_name: 'Jan Kowalski' },
      created_at: new Date().toISOString().slice(0, 10),
    }

    linkList.value.unshift(newLink)
    snackbarText.value = 'Link dodany pomyslnie'
  }

  drawerVisible.value = false
  snackbar.value = true
}

function confirmDelete(link: ProjectLink) {
  linkToDelete.value = link
  deleteDialog.value = true
}

function deleteLink() {
  if (linkToDelete.value) {
    linkList.value = linkList.value.filter(l => l.id !== linkToDelete.value!.id)
    snackbarText.value = 'Link usuniety'
    snackbar.value = true
  }
  deleteDialog.value = false
  linkToDelete.value = null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-link"
          size="24"
          class="me-1"
        />
        <span class="text-h5">Linki Projektowe</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj linkow..."
          density="compact"
          hide-details
          style="max-inline-size: 280px;"
        />
        <VSelect
          v-model="projectFilter"
          :items="projectOptions"
          placeholder="Filtruj po projekcie"
          density="compact"
          hide-details
          clearable
          style="max-inline-size: 250px;"
        />
        <VBtn
          color="primary"
          prepend-icon="tabler-link"
          @click="openCreateDrawer"
        >
          Dodaj Link
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="filteredLinks"
        :search="search"
        :items-per-page="10"
        hover
      >
        <template #item.project.name="{ item }">
          <span class="font-weight-bold text-medium-emphasis">{{ item.project?.name }}</span>
        </template>

        <template #item.url="{ item }">
          <div>
            <a
              :href="item.url"
              class="text-decoration-none text-primary"
              target="_blank"
            >
              <VIcon
                icon="tabler-external-link"
                size="14"
                class="me-1"
              />
              {{ item.url }}
            </a>
            <div
              v-if="item.description"
              class="text-caption text-medium-emphasis"
            >
              {{ item.description }}
            </div>
          </div>
        </template>

        <template #item.user.full_name="{ item }">
          <span class="text-medium-emphasis">{{ item.user.full_name }}</span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon="tabler-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="openEditDrawer(item)"
          />
          <VBtn
            icon="tabler-trash"
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(item)"
          />
        </template>

        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">
            <VIcon
              icon="tabler-link-off"
              size="48"
              class="mb-3 d-block mx-auto"
              color="secondary"
            />
            Brak linkow do wyswietlenia
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Drawer -->
    <VNavigationDrawer
      v-model="drawerVisible"
      location="end"
      temporary
      width="400"
    >
      <div class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
          <h5 class="text-h5">
            {{ editingLink ? 'Edytuj Link' : 'Dodaj Link' }}
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
          <VSelect
            v-model="formProject"
            :items="projectOptions"
            label="Projekt"
            :rules="projectRules"
            class="mb-4"
          />

          <VTextField
            v-model="formUrl"
            label="URL"
            :rules="urlRules"
            placeholder="https://..."
            class="mb-4"
          />

          <VTextField
            v-model="formDescription"
            label="Opis"
            class="mb-4"
          />

          <VBtn
            type="submit"
            color="primary"
            block
            :disabled="!formValid"
          >
            {{ editingLink ? 'Zapisz Zmiany' : 'Dodaj Link' }}
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
        <VCardTitle class="d-flex align-center">
          <VIcon
            icon="tabler-alert-triangle"
            color="error"
            class="me-2"
          />
          Potwierdzenie usuwania
        </VCardTitle>
        <VCardText>Czy na pewno chcesz usunac link "{{ linkToDelete?.url }}"?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="deleteDialog = false"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="error"
            @click="deleteLink"
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
