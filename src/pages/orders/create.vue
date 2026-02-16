<script lang="ts" setup>
import { asgroups, projects, trades, types } from '@/data/mock'

// ── Form Data ──────────────────────────────────────────
const form = ref({
  project_id: null as number | null,
  trade_id: null as number | null,
  type_id: null as number | null,
  asgroup_ids: [] as number[],
  location: '',
  kms: '',
  dwg_no: '',
  completion_date: '',
  description: '',
  company: '',
  extra_contact: '',
  notes: '',
})

// ── Options ────────────────────────────────────────────
const projectOptions = projects
  .filter(p => !p.closed)
  .map(p => ({ title: p.name, value: p.id }))

const tradeOptions = trades.map(t => ({ title: t.name, value: t.id }))
const typeOptions = types.map(t => ({ title: t.name, value: t.id }))

const filteredAsgroupOptions = computed(() => {
  if (!form.value.project_id)
    return []

  return asgroups
    .filter(a => a.project_id === form.value.project_id)
    .map(a => ({ title: a.name, value: a.id }))
})

// Clear asgroups when project changes
watch(() => form.value.project_id, () => {
  form.value.asgroup_ids = []
})

// ── Validation ─────────────────────────────────────────
const formRef = ref()
const isSubmitting = ref(false)
const showSnackbar = ref(false)

const rules = {
  required: (v: any) => !!v || 'Pole wymagane',
  requiredSelect: (v: any) => v !== null && v !== undefined || 'Pole wymagane',
  locationMin: (v: string) => (v && v.length >= 5) || 'Minimum 5 znakow',
  locationMax: (v: string) => (!v || v.length <= 521) || 'Maksymalnie 521 znakow',
  maxDwg: (v: string) => (!v || v.length <= 255) || 'Maksymalnie 255 znakow',
}

const onSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid)
    return

  isSubmitting.value = true

  // Simulate API call
  setTimeout(() => {
    isSubmitting.value = false
    showSnackbar.value = true
  }, 800)
}

const onCancel = () => {
  navigateTo('/orders')
}

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="d-flex align-center gap-2 mb-1">
          <VIcon
            icon="tabler-file-plus"
            size="28"
            color="primary"
          />
          <h4 class="text-h4">
            Nowe zlecenie
          </h4>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Wypelnij formularz aby utworzyc nowe zlecenie
        </p>
      </div>
      <VBtn
        variant="tonal"
        color="secondary"
        prepend-icon="tabler-arrow-left"
        @click="onCancel"
      >
        Powrot do listy
      </VBtn>
    </div>

    <VForm
      ref="formRef"
      @submit.prevent="onSubmit"
    >
      <VRow>
        <VCol
          cols="12"
          md="8"
          class="mx-auto"
        >
          <!-- Section 1: Dane Podstawowe -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center pa-5">
              <VIcon
                icon="tabler-file-text"
                class="me-2"
                color="primary"
              />
              Dane Podstawowe
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppAutocomplete
                    v-model="form.project_id"
                    :items="projectOptions"
                    label="Projekt *"
                    placeholder="Wybierz projekt"
                    :rules="[rules.requiredSelect]"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppAutocomplete
                    v-model="form.trade_id"
                    :items="tradeOptions"
                    label="Branza *"
                    placeholder="Wybierz branze"
                    :rules="[rules.requiredSelect]"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppAutocomplete
                    v-model="form.type_id"
                    :items="typeOptions"
                    label="Rodzaj *"
                    placeholder="Wybierz rodzaj"
                    :rules="[rules.requiredSelect]"
                    clearable
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppAutocomplete
                    v-model="form.asgroup_ids"
                    :items="filteredAsgroupOptions"
                    label="Asortymenty"
                    placeholder="Wybierz asortymenty"
                    multiple
                    chips
                    closable-chips
                    clearable
                    :disabled="!form.project_id"
                    :hint="!form.project_id ? 'Najpierw wybierz projekt' : ''"
                    persistent-hint
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Section 2: Szczegoly Zlecenia -->
          <VCard class="mb-6">
            <VCardTitle class="d-flex align-center pa-5">
              <VIcon
                icon="tabler-map"
                class="me-2"
                color="primary"
              />
              Szczegoly Zlecenia
            </VCardTitle>
            <VDivider />
            <VCardText>
              <VRow>
                <VCol
                  cols="12"
                  sm="8"
                >
                  <AppTextField
                    v-model="form.location"
                    label="Lokalizacja *"
                    placeholder="np. km 12+450 - km 12+680, strona lewa"
                    :rules="[rules.required, rules.locationMin, rules.locationMax]"
                    counter="521"
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <AppTextField
                    v-model="form.kms"
                    label="Kilometraz"
                    placeholder="np. 12.450"
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppTextField
                    v-model="form.dwg_no"
                    label="Nr rysunku *"
                    placeholder="np. RYS-001/WD-5"
                    :rules="[rules.required, rules.maxDwg]"
                    counter="255"
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppTextField
                    v-model="form.completion_date"
                    label="Termin realizacji *"
                    type="date"
                    :rules="[rules.required]"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                    v-model="form.description"
                    label="Opis *"
                    placeholder="Opisz zlecenie..."
                    :rules="[rules.required]"
                    rows="3"
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppTextField
                    v-model="form.company"
                    label="Firma"
                    placeholder="Nazwa firmy (opcjonalnie)"
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <AppTextField
                    v-model="form.extra_contact"
                    label="Dodatkowy kontakt"
                    placeholder="Nr telefonu lub email"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                    v-model="form.notes"
                    label="Uwagi"
                    placeholder="Dodatkowe uwagi..."
                    rows="2"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Actions -->
          <div class="d-flex justify-end gap-4">
            <VBtn
              variant="tonal"
              color="secondary"
              size="large"
              @click="onCancel"
            >
              Anuluj
            </VBtn>
            <VBtn
              type="submit"
              color="primary"
              size="large"
              :loading="isSubmitting"
              prepend-icon="tabler-check"
            >
              Utworz zlecenie
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VForm>

    <!-- Success Snackbar -->
    <VSnackbar
      v-model="showSnackbar"
      color="success"
      :timeout="4000"
      location="top end"
    >
      <VIcon
        icon="tabler-check"
        class="me-2"
      />
      Zlecenie zostalo utworzone pomyslnie!
      <template #actions>
        <VBtn
          variant="text"
          @click="showSnackbar = false"
        >
          Zamknij
        </VBtn>
      </template>
    </VSnackbar>
  </div>
</template>
