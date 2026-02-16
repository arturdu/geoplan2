<script lang="ts" setup>
import { trades as mockTrades } from '@/data/mock'
import type { Trade } from '@/types'

const search = ref('')
const drawerVisible = ref(false)
const editingTrade = ref<Trade | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const deleteDialog = ref(false)
const tradeToDelete = ref<Trade | null>(null)

const tradeList = ref<Trade[]>([...mockTrades])

const tradeIconOptions = [
  { icon: 'tabler-road', label: 'Droga' },
  { icon: 'tabler-bridge', label: 'Most' },
  { icon: 'tabler-train', label: 'Kolej' },
  { icon: 'tabler-droplet', label: 'Woda' },
  { icon: 'tabler-bolt', label: 'Energia' },
  { icon: 'tabler-building', label: 'Budynek' },
  { icon: 'tabler-crane', label: 'Dzwig' },
  { icon: 'tabler-shovel', label: 'Roboty ziemne' },
  { icon: 'tabler-hammer', label: 'Budownictwo' },
  { icon: 'tabler-ruler', label: 'Pomiary' },
]

const headers = [
  { title: 'Ikona', key: 'icon', sortable: false, width: 70 },
  { title: 'Nazwa', key: 'name', sortable: true },
  { title: 'Zlecenia', key: 'orders_count', sortable: true },
  { title: 'Definicja', key: 'definition', sortable: true },
  { title: 'Akcje', key: 'actions', sortable: false, width: 120 },
]

// Form state
const formName = ref('')
const formDefinition = ref('')
const formIcon = ref('tabler-road')
const formValid = ref(false)

const nameRules = [(v: string) => !!v || 'Nazwa jest wymagana']

function openCreateDrawer() {
  editingTrade.value = null
  formName.value = ''
  formDefinition.value = ''
  formIcon.value = 'tabler-road'
  drawerVisible.value = true
}

function openEditDrawer(trade: Trade) {
  editingTrade.value = trade
  formName.value = trade.name
  formDefinition.value = trade.definition
  formIcon.value = trade.icon || 'tabler-road'
  drawerVisible.value = true
}

function submitForm() {
  if (!formName.value) return

  if (editingTrade.value) {
    const idx = tradeList.value.findIndex(t => t.id === editingTrade.value!.id)
    if (idx !== -1) {
      tradeList.value[idx] = {
        ...tradeList.value[idx],
        name: formName.value,
        definition: formDefinition.value,
        icon: formIcon.value,
      }
    }
    snackbarText.value = 'Branza zaktualizowana pomyslnie'
  }
  else {
    const newTrade: Trade = {
      id: Date.now(),
      name: formName.value,
      definition: formDefinition.value,
      orders_count: 0,
      icon: formIcon.value,
    }
    tradeList.value.push(newTrade)
    snackbarText.value = 'Branza utworzona pomyslnie'
  }

  drawerVisible.value = false
  snackbar.value = true
}

function confirmDelete(trade: Trade) {
  tradeToDelete.value = trade
  deleteDialog.value = true
}

function deleteTrade() {
  if (tradeToDelete.value) {
    tradeList.value = tradeList.value.filter(t => t.id !== tradeToDelete.value!.id)
    snackbarText.value = 'Branza usunieta'
    snackbar.value = true
  }
  deleteDialog.value = false
  tradeToDelete.value = null
}
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center flex-wrap gap-4 pa-6">
        <VIcon
          icon="tabler-road"
          size="28"
          class="me-1"
        />
        <span class="text-h5">Branze</span>
        <VSpacer />
        <VTextField
          v-model="search"
          prepend-inner-icon="tabler-search"
          placeholder="Szukaj branz..."
          density="compact"
          hide-details
          style="max-inline-size: 280px;"
        />
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="openCreateDrawer"
        >
          Nowa Branza
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VDataTable
        :headers="headers"
        :items="tradeList"
        :search="search"
        :items-per-page="10"
        :sort-by="[{ key: 'orders_count', order: 'desc' }]"
        hover
        class="trades-table"
      >
        <template #item.icon="{ item }">
          <VIcon
            :icon="item.icon || 'tabler-road'"
            size="22"
            color="primary"
          />
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center gap-2">
            <span class="font-weight-bold text-primary">{{ item.name }}</span>
          </div>
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
              Brak branz
            </p>
            <p class="text-body-2 text-disabled mb-0">
              Brak branz do wyswietlenia. Utworz nowa branze.
            </p>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Drawer -->
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
              :icon="editingTrade ? 'tabler-pencil' : 'tabler-plus'"
              size="24"
              class="me-2"
            />
            {{ editingTrade ? 'Edytuj Branze' : 'Nowa Branza' }}
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
                v-for="opt in tradeIconOptions"
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
            :prepend-icon="editingTrade ? 'tabler-device-floppy' : 'tabler-plus'"
          >
            {{ editingTrade ? 'Zapisz Zmiany' : 'Utworz Branze' }}
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
        <VCardText>Czy na pewno chcesz usunac branze "{{ tradeToDelete?.name }}"?</VCardText>
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
            @click="deleteTrade"
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
.trades-table {
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
