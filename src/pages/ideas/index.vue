<script lang="ts" setup>
import draggable from 'vuedraggable'
import { ideas as mockIdeas } from '@/data/mock'
import type { Idea, IdeaStatus } from '@/types'
import { ideaStatusConfig } from '@/types'

const columns = ref<Record<IdeaStatus, Idea[]>>({
  considering: [],
  under: [],
  implemented: [],
  closed: [],
})

// Initialize columns from mock data
mockIdeas.forEach(idea => {
  columns.value[idea.status].push({ ...idea })
})

const drawerVisible = ref(false)
const editingIdea = ref<Idea | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const ideaToDelete = ref<Idea | null>(null)

// Form state
const formTitle = ref('')
const formDescription = ref('')
const formValid = ref(false)

const titleRules = [(v: string) => !!v || 'Tytul jest wymagany']
const descriptionRules = [(v: string) => !!v || 'Opis jest wymagany']

const statusKeys: IdeaStatus[] = ['considering', 'under', 'implemented', 'closed']

function openCreateDrawer() {
  editingIdea.value = null
  formTitle.value = ''
  formDescription.value = ''
  drawerVisible.value = true
}

function openEditDrawer(idea: Idea) {
  editingIdea.value = idea
  formTitle.value = idea.title
  formDescription.value = idea.description
  drawerVisible.value = true
}

function submitForm() {
  if (!formTitle.value || !formDescription.value) return

  if (editingIdea.value) {
    // Update existing
    for (const status of statusKeys) {
      const idx = columns.value[status].findIndex(i => i.id === editingIdea.value!.id)
      if (idx !== -1) {
        columns.value[status][idx] = {
          ...columns.value[status][idx],
          title: formTitle.value,
          description: formDescription.value,
        }
        break
      }
    }
    snackbarText.value = 'Propozycja zaktualizowana pomyslnie'
  }
  else {
    const newIdea: Idea = {
      id: Date.now(),
      title: formTitle.value,
      description: formDescription.value,
      status: 'considering',
      created_at: new Date().toISOString().slice(0, 10),
    }
    columns.value.considering.unshift(newIdea)
    snackbarText.value = 'Propozycja dodana pomyslnie'
  }

  drawerVisible.value = false
  snackbar.value = true
}

function confirmDelete() {
  ideaToDelete.value = editingIdea.value
  deleteDialog.value = true
}

function deleteIdea() {
  if (ideaToDelete.value) {
    for (const status of statusKeys) {
      const idx = columns.value[status].findIndex(i => i.id === ideaToDelete.value!.id)
      if (idx !== -1) {
        columns.value[status].splice(idx, 1)
        break
      }
    }
    snackbarText.value = 'Propozycja usunieta'
    snackbar.value = true
    drawerVisible.value = false
  }
  deleteDialog.value = false
  ideaToDelete.value = null
}

function truncate(text: string, length: number = 80): string {
  return text.length > length ? `${text.substring(0, length)}...` : text
}
</script>

<template>
  <div>
    <VCard class="mb-6">
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-bulb"
          size="24"
          class="me-1"
        />
        <span class="text-h5">Tablica Pomyslow</span>
        <VSpacer />
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDrawer"
        >
          Nowa Propozycja
        </VBtn>
      </VCardTitle>
    </VCard>

    <VRow>
      <VCol
        v-for="status in statusKeys"
        :key="status"
        cols="12"
        md="6"
        lg="3"
      >
        <VCard variant="outlined">
          <VCardTitle class="d-flex align-center gap-2 pa-4">
            <VIcon
              :icon="ideaStatusConfig[status].icon"
              :color="ideaStatusConfig[status].color"
              size="20"
            />
            <span>{{ ideaStatusConfig[status].label }}</span>
            <VChip
              :color="ideaStatusConfig[status].color"
              size="x-small"
              label
            >
              {{ columns[status].length }}
            </VChip>
          </VCardTitle>

          <VDivider />

          <div class="pa-3" style="min-block-size: 300px;">
            <draggable
              v-model="columns[status]"
              group="ideas"
              item-key="id"
              :animation="200"
              ghost-class="ghost-card"
              class="d-flex flex-column gap-3"
              style="min-block-size: 280px;"
            >
              <template #item="{ element }">
                <VCard
                  class="kanban-card cursor-pointer"
                  variant="tonal"
                  :color="ideaStatusConfig[status].color"
                  @click="openEditDrawer(element)"
                >
                  <VCardText class="pa-3">
                    <h6 class="text-subtitle-1 font-weight-bold mb-1">
                      {{ element.title }}
                    </h6>
                    <p class="text-caption text-medium-emphasis mb-0">
                      {{ truncate(element.description) }}
                    </p>
                  </VCardText>
                </VCard>
              </template>
            </draggable>
          </div>
        </VCard>
      </VCol>
    </VRow>

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
            {{ editingIdea ? 'Edytuj Propozycje' : 'Nowa Propozycja' }}
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
            v-model="formTitle"
            label="Tytul"
            :rules="titleRules"
            class="mb-4"
          />

          <VTextarea
            v-model="formDescription"
            label="Opis"
            :rules="descriptionRules"
            rows="5"
            class="mb-4"
          />

          <VBtn
            type="submit"
            color="primary"
            block
            :disabled="!formValid"
            class="mb-3"
          >
            {{ editingIdea ? 'Zapisz Zmiany' : 'Dodaj Propozycje' }}
          </VBtn>

          <VBtn
            v-if="editingIdea"
            color="error"
            variant="outlined"
            block
            prepend-icon="tabler-trash"
            @click="confirmDelete"
          >
            Usun Propozycje
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
        <VCardTitle>Potwierdzenie usuwania</VCardTitle>
        <VCardText>Czy na pewno chcesz usunac propozycje "{{ ideaToDelete?.title }}"?</VCardText>
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
            @click="deleteIdea"
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

<style scoped>
.ghost-card {
  opacity: 0.5;
}

.kanban-card {
  transition: transform 0.15s ease;
}

.kanban-card:hover {
  transform: translateY(-2px);
}
</style>
