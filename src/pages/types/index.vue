<script lang="ts" setup>
import { types as mockTypes } from '@/data/mock'
import type { Type } from '@/types'

const search = ref('')
const drawerVisible = ref(false)
const editingType = ref<Type | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const typeToDelete = ref<Type | null>(null)

const typeList = ref<Type[]>([...mockTypes])

const headers = [
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Definicja', key: 'definition', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: 120 },
]

// Form state
const formName = ref('')
const formDefinition = ref('')
const formValid = ref(false)

const nameRules = [(v: string) => !!v || 'Nazwa jest wymagana']

function openCreateDrawer() {
  editingType.value = null
  formName.value = ''
  formDefinition.value = ''
  drawerVisible.value = true
}

function openEditDrawer(type: Type) {
  editingType.value = type
  formName.value = type.name
  formDefinition.value = type.definition
  drawerVisible.value = true
}

function submitForm() {
  if (!formName.value) return

  if (editingType.value) {
    const idx = typeList.value.findIndex(t => t.id === editingType.value!.id)
    if (idx !== -1) {
      typeList.value[idx] = {
        ...typeList.value[idx],
        name: formName.value,
        definition: formDefinition.value,
      }
    }
    snackbarText.value = 'Typ zaktualizowany pomyslnie'
  }
  else {
    const newType: Type = {
      id: Date.now(),
      name: formName.value,
      definition: formDefinition.value,
      orders_count: 0,
    }
    typeList.value.push(newType)
    snackbarText.value = 'Typ utworzony pomyslnie'
  }

  drawerVisible.value = false
  snackbar.value = true
}

function confirmDelete(type: Type) {
  typeToDelete.value = type
  deleteDialog.value = true
}

function deleteType() {
  if (typeToDelete.value) {
    typeList.value = typeList.value.filter(t => t.id !== typeToDelete.value!.id)
    snackbarText.value = 'Typ usuniety'
    snackbar.value = true
  }
  deleteDialog.value = false
  typeToDelete.value = null
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-flag"
          size="24"
          class="me-1"
        />
        <span class="text-h5">Typy Zlecen</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj typow..."
          density="compact"
          hide-details
          style="max-inline-size: 280px;"
        />
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDrawer"
        >
          Nowy Typ
        </VBtn>
      </VCardTitle>

      <VDataTable
        :headers="headers"
        :items="typeList"
        :search="search"
        :items-per-page="10"
        :sort-by="[{ key: 'orders_count', order: 'desc' }]"
        hover
      >
        <template #item.name="{ item }">
          <span class="font-weight-bold text-primary">{{ item.name }}</span>
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

        <template #item.definition="{ item }">
          <span class="text-medium-emphasis">{{ item.definition }}</span>
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
              icon="tabler-flag-off"
              size="48"
              class="mb-3 d-block mx-auto"
              color="secondary"
            />
            Brak typow do wyswietlenia
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
            {{ editingType ? 'Edytuj Typ' : 'Nowy Typ' }}
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
            :rules="nameRules"
            class="mb-4"
          />

          <VTextarea
            v-model="formDefinition"
            label="Definicja"
            rows="4"
            class="mb-4"
          />

          <VBtn
            type="submit"
            color="primary"
            block
            :disabled="!formValid"
          >
            {{ editingType ? 'Zapisz Zmiany' : 'Utworz Typ' }}
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
        <VCardText>Czy na pewno chcesz usunac typ "{{ typeToDelete?.name }}"?</VCardText>
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
            @click="deleteType"
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
