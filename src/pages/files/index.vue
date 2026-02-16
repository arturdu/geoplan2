<script lang="ts" setup>
import { projectFiles as mockFiles, projects } from '@/data/mock'
import type { ProjectFile } from '@/types'

const search = ref('')
const projectFilter = ref<number | null>(null)
const dialogVisible = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const fileToDelete = ref<ProjectFile | null>(null)

const fileList = ref<ProjectFile[]>([...mockFiles])

const projectOptions = projects.map(p => ({ title: p.name, value: p.id }))

const headers = [
  { title: 'Projekt', key: 'project.name', sortable: true },
  { title: 'Nazwa pliku', key: 'file_name', sortable: true },
  { title: 'Dodal', key: 'user.full_name', sortable: true },
  { title: 'Data dodania', key: 'created_at', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: 80 },
]

const filteredFiles = computed(() => {
  return fileList.value.filter(file => {
    const matchesSearch = !search.value
      || file.file_name.toLowerCase().includes(search.value.toLowerCase())
      || file.project?.name.toLowerCase().includes(search.value.toLowerCase())

    const matchesProject = !projectFilter.value || file.project_id === projectFilter.value

    return matchesSearch && matchesProject
  })
})

// Form state
const formProject = ref<number | null>(null)
const formDescription = ref('')
const formFileName = ref('')
const formValid = ref(false)

const projectRules = [(v: number | null) => !!v || 'Projekt jest wymagany']
const fileRules = [(v: string) => !!v || 'Plik jest wymagany']

function openCreateDialog() {
  formProject.value = null
  formDescription.value = ''
  formFileName.value = ''
  dialogVisible.value = true
}

function submitForm() {
  if (!formProject.value || !formFileName.value) return

  const project = projects.find(p => p.id === formProject.value)

  const newFile: ProjectFile = {
    id: Date.now(),
    project_id: formProject.value,
    project,
    file_name: formFileName.value,
    file_url: '#',
    description: formDescription.value,
    user: { full_name: 'Jan Kowalski' },
    created_at: new Date().toISOString().slice(0, 10),
  }

  fileList.value.unshift(newFile)
  dialogVisible.value = false
  snackbarText.value = 'Plik dodany pomyslnie'
  snackbar.value = true
}

function confirmDelete(file: ProjectFile) {
  fileToDelete.value = file
  deleteDialog.value = true
}

function deleteFile() {
  if (fileToDelete.value) {
    fileList.value = fileList.value.filter(f => f.id !== fileToDelete.value!.id)
    snackbarText.value = 'Plik usuniety'
    snackbar.value = true
  }
  deleteDialog.value = false
  fileToDelete.value = null
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
          icon="tabler-files"
          size="24"
          class="me-1"
        />
        <span class="text-h5">Pliki Projektowe</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj plikow..."
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
          prepend-icon="tabler-upload"
          @click="openCreateDialog"
        >
          Dodaj Plik
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="filteredFiles"
        :search="search"
        :items-per-page="10"
        hover
      >
        <template #item.project.name="{ item }">
          <span class="font-weight-bold text-primary">{{ item.project?.name }}</span>
        </template>

        <template #item.file_name="{ item }">
          <a
            :href="item.file_url"
            class="text-decoration-none"
            target="_blank"
          >
            <VIcon
              icon="tabler-file"
              size="16"
              class="me-1"
            />
            {{ item.file_name }}
          </a>
        </template>

        <template #item.user.full_name="{ item }">
          <span class="text-medium-emphasis">{{ item.user.full_name }}</span>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
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
              icon="tabler-files-off"
              size="48"
              class="mb-3 d-block mx-auto"
              color="secondary"
            />
            Brak plikow do wyswietlenia
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create Dialog -->
    <VDialog
      v-model="dialogVisible"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="d-flex align-center pa-6">
          <VIcon
            icon="tabler-upload"
            class="me-2"
          />
          Dodaj Plik
        </VCardTitle>
        <VCardText class="pa-6 pt-0">
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
              v-model="formDescription"
              label="Opis"
              class="mb-4"
            />

            <VTextField
              v-model="formFileName"
              label="Plik"
              :rules="fileRules"
              placeholder="Wybierz plik..."
              prepend-inner-icon="tabler-upload"
              hint="Symulowane pole wyboru pliku"
              persistent-hint
              class="mb-4"
            />

            <div class="d-flex justify-end gap-2">
              <VBtn
                variant="text"
                @click="dialogVisible = false"
              >
                Anuluj
              </VBtn>
              <VBtn
                type="submit"
                color="primary"
                :disabled="!formValid"
              >
                Dodaj
              </VBtn>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>

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
        <VCardText>Czy na pewno chcesz usunac plik "{{ fileToDelete?.file_name }}"?</VCardText>
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
            @click="deleteFile"
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
