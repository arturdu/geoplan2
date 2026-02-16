<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core'
import { orders, projects, edzrgTasks } from '@/data/mock'
import type { Order, Project, EdzrgTask } from '@/types'

// ── Event Type Definition ──────────────────────────────────
interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  type: 'order' | 'deadline' | 'inspection' | 'meeting' | 'task' | 'fieldwork' | 'training' | 'report'
  backgroundColor: string
  borderColor: string
  description?: string
  relatedId?: number
  location?: string
  participants?: string[]
  status?: string
  extendedProps?: {
    type: string
    description?: string
    relatedId?: number
    location?: string
    participants?: string[]
    status?: string
  }
}

// ── Event Type Colors ──────────────────────────────────────
const eventTypeColors = {
  order: { bg: '#7367F0', border: '#7367F0' }, // Primary
  deadline: { bg: '#FF9F43', border: '#FF9F43' }, // Warning
  inspection: { bg: '#28C76F', border: '#28C76F' }, // Success
  meeting: { bg: '#EA5455', border: '#EA5455' }, // Error
  task: { bg: '#00CFE8', border: '#00CFE8' }, // Info
  fieldwork: { bg: '#9C27B0', border: '#9C27B0' }, // Purple
  training: { bg: '#FF6D00', border: '#FF6D00' }, // Deep Orange
  report: { bg: '#00897B', border: '#00897B' }, // Teal
}

// ── State ───────────────────────────────────────────────────
const calendarRef = ref()
const selectedView = ref('dayGridMonth')
const selectedFilters = ref<string[]>(['order', 'deadline', 'inspection', 'meeting', 'task', 'fieldwork', 'training', 'report'])
const isLeftSidebarOpen = ref(true)
const eventDialog = ref(false)
const addEventDialog = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

// New event form
const newEvent = ref({
  title: '',
  start: '',
  end: '',
  type: 'meeting' as CalendarEvent['type'],
  description: '',
})

// ── Generate Calendar Events ───────────────────────────────
const generateEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = []

  // 1. Generate events from orders (completion dates)
  orders.forEach((order: Order) => {
    if (order.completion_date) {
      events.push({
        id: `order-${order.id}`,
        title: `${order.order_no} - Termin`,
        start: order.completion_date,
        type: 'order',
        backgroundColor: eventTypeColors.order.bg,
        borderColor: eventTypeColors.order.border,
        description: order.description,
        relatedId: order.id,
        extendedProps: {
          type: 'order',
          description: order.description,
          relatedId: order.id,
        },
      })
    }

    // 2. Generate inspection events
    if (order.inspected_at) {
      events.push({
        id: `inspection-${order.id}`,
        title: `IK: ${order.order_no}`,
        start: order.inspected_at,
        type: 'inspection',
        backgroundColor: eventTypeColors.inspection.bg,
        borderColor: eventTypeColors.inspection.border,
        description: `Inspekcja zlecenia ${order.order_no}`,
        relatedId: order.id,
        extendedProps: {
          type: 'inspection',
          description: `Inspekcja zlecenia ${order.order_no}`,
          relatedId: order.id,
        },
      })
    }
  })

  // 3. Generate project deadline events
  projects.forEach((project: Project) => {
    if (project.min_date) {
      events.push({
        id: `deadline-${project.id}`,
        title: `Deadline: ${project.name}`,
        start: project.min_date,
        type: 'deadline',
        backgroundColor: eventTypeColors.deadline.bg,
        borderColor: eventTypeColors.deadline.border,
        description: project.info,
        relatedId: project.id,
        extendedProps: {
          type: 'deadline',
          description: project.info,
          relatedId: project.id,
        },
      })
    }
  })

  // 4. Generate events from EDZRG tasks
  edzrgTasks.forEach((task: EdzrgTask) => {
    if (task.handed) {
      events.push({
        id: `task-${task.id}`,
        title: `${task.task_no} - Przekazanie`,
        start: task.handed,
        type: 'task',
        backgroundColor: eventTypeColors.task.bg,
        borderColor: eventTypeColors.task.border,
        description: task.info || `Zadanie: ${task.work?.name}`,
        relatedId: task.id,
        extendedProps: {
          type: 'task',
          description: task.info || `Zadanie: ${task.work?.name}`,
          relatedId: task.id,
        },
      })
    }
  })

  // 5. Generate enhanced events with more details
  const enhancedEvents = [
    // Meetings
    {
      date: '2026-02-18',
      title: 'Spotkanie z BudMont',
      desc: 'Omowienie postepow na S7 - przegląd realizacji etapu I',
      type: 'meeting',
      location: 'Biuro GDDKiA, Katowice',
      participants: ['Jan Kowalski', 'Anna Nowak', 'Piotr Wójcik'],
      status: 'Potwierdzone',
    },
    {
      date: '2026-02-20',
      title: 'Spotkanie koordynacyjne',
      desc: 'Koordynacja zlecen na projekcie Obwodnica Zatora',
      type: 'meeting',
      location: 'Sala konferencyjna, Biuro',
      participants: ['Zespol geodezyjny', 'Kierownik projektu'],
      status: 'Zaplanowane',
    },
    {
      date: '2026-02-25',
      title: 'Prezentacja wynikow',
      desc: 'Prezentacja wynikow pomiarow dla inwestora - finalne raporty',
      type: 'meeting',
      location: 'Siedziba inwestora',
      participants: ['Dyrektor', 'Inwestor', 'IK'],
      status: 'Potwierdzone',
    },
    {
      date: '2026-03-01',
      title: 'Spotkanie z IK',
      desc: 'Konsultacje z inwestorem kontroli - omówienie uwag',
      type: 'meeting',
      location: 'Online - MS Teams',
      participants: ['Inspektor', 'Koordynator'],
      status: 'Oczekuje',
    },
    {
      date: '2026-03-10',
      title: 'Narada techniczna',
      desc: 'Omówienie problemow technicznych na budowie S19',
      type: 'meeting',
      location: 'Plac budowy S19',
      participants: ['Kierownik budowy', 'Geodeta', 'Projektant'],
      status: 'Zaplanowane',
    },

    // Field Work
    {
      date: '2026-02-17',
      title: 'Tyczenie osi trasy',
      desc: 'Pomiary w terenie - tyczenie osi drogi S7 km 12+400',
      type: 'fieldwork',
      location: 'S7 km 12+400 - 15+200',
      participants: ['Geodeta senior', 'Pomocnik'],
      status: 'W realizacji',
    },
    {
      date: '2026-02-19',
      title: 'Inwentaryzacja powykonawcza',
      desc: 'Pomiary powykonawcze kanalizacji - ulica Kwiatowa',
      type: 'fieldwork',
      location: 'Kraków, ul. Kwiatowa',
      participants: ['Zespol pomiarowy 2'],
      status: 'Zaplanowane',
    },
    {
      date: '2026-02-22',
      title: 'Mapa do celów projektowych',
      desc: 'Pomiary dla projektanta - teren inwestycji w Wadowicach',
      type: 'fieldwork',
      location: 'Wadowice, obręb Klecza',
      participants: ['Geodeta', 'Pomocnik', 'Projektant'],
      status: 'Zaplanowane',
    },
    {
      date: '2026-02-26',
      title: 'Kontrola realizacji',
      desc: 'Sprawdzenie zgodności realizacji z projektem - most M1',
      type: 'fieldwork',
      location: 'Most M1, DK7',
      participants: ['Geodeta kontrolny'],
      status: 'Zaplanowane',
    },
    {
      date: '2026-03-03',
      title: 'Wyznaczenie wysokości',
      desc: 'Pomiary wysokościowe dla fundamentów',
      type: 'fieldwork',
      location: 'Nowa Huta, budowa hali',
      participants: ['Zespol pomiarowy 1'],
      status: 'Zaplanowane',
    },
    {
      date: '2026-03-06',
      title: 'Osnowa geodezyjna',
      desc: 'Pomiary osnowy geodezyjnej dla inwestycji',
      type: 'fieldwork',
      location: 'Obwodnica Zatora',
      participants: ['Geodeta senior', '2 pomocników'],
      status: 'Zaplanowane',
    },

    // Training
    {
      date: '2026-03-05',
      title: 'Szkolenie BIM',
      desc: 'Szkolenie z nowych narzedzi BIM i modelowania 3D',
      type: 'training',
      location: 'Centrum Szkoleniowe, Warszawa',
      participants: ['Cały zespół'],
      status: 'Zarejestrowane',
    },
    {
      date: '2026-03-12',
      title: 'Warsztaty AutoCAD Civil 3D',
      desc: 'Zaawansowane funkcje Civil 3D dla geodetów',
      type: 'training',
      location: 'Online',
      participants: ['Geodeci projektowi'],
      status: 'Zapisane',
    },
    {
      date: '2026-03-15',
      title: 'Nowe przepisy prawne',
      desc: 'Szkolenie z aktualnych przepisów geodezyjnych',
      type: 'training',
      location: 'Hotel Mercure, Kraków',
      participants: ['Kierownicy projektów'],
      status: 'Potwierdzone',
    },

    // Reports
    {
      date: '2026-02-21',
      title: 'Raport miesięczny',
      desc: 'Termin złożenia raportu z realizacji zlecen - luty 2026',
      type: 'report',
      location: 'Biuro',
      participants: ['Koordynator'],
      status: 'Do wykonania',
    },
    {
      date: '2026-02-28',
      title: 'Operat geodezyjny',
      desc: 'Deadline przekazania operatu dla projektu S7',
      type: 'report',
      location: 'Biuro',
      participants: ['Geodeta prowadzący'],
      status: 'W przygotowaniu',
    },
    {
      date: '2026-03-07',
      title: 'Raport postępu',
      desc: 'Raport z postępu prac na kontrakcie Obwodnica',
      type: 'report',
      location: 'GDDKiA',
      participants: ['Kierownik kontraktu'],
      status: 'Zaplanowane',
    },
    {
      date: '2026-03-14',
      title: 'Dokumentacja powykonawcza',
      desc: 'Termin złożenia dokumentacji powykonawczej - etap II',
      type: 'report',
      location: 'Urząd Gminy',
      participants: ['Geodeta', 'Prawnik'],
      status: 'Przygotowanie',
    },
  ]

  enhancedEvents.forEach((event, idx) => {
    events.push({
      id: `event-${idx + 1}`,
      title: event.title,
      start: event.date,
      type: event.type as CalendarEvent['type'],
      backgroundColor: eventTypeColors[event.type as keyof typeof eventTypeColors].bg,
      borderColor: eventTypeColors[event.type as keyof typeof eventTypeColors].border,
      description: event.desc,
      location: event.location,
      participants: event.participants,
      status: event.status,
      extendedProps: {
        type: event.type,
        description: event.desc,
        location: event.location,
        participants: event.participants,
        status: event.status,
      },
    })
  })

  return events
}

const allEvents = computed(() => generateEvents())

// ── Filtered Events ────────────────────────────────────────
const filteredEvents = computed(() => {
  return allEvents.value.filter(event => selectedFilters.value.includes(event.type))
})

// ── Calendar Options ───────────────────────────────────────
const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: selectedView.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  events: filteredEvents.value as EventInput[],
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  eventClick: handleEventClick,
  select: handleDateSelect,
  locale: 'pl',
  firstDay: 1,
  buttonText: {
    today: 'Dzis',
    month: 'Miesiac',
    week: 'Tydzien',
    day: 'Dzien',
    list: 'Lista',
  },
  height: 'auto',
}))

// ── Event Handlers ─────────────────────────────────────────
const handleEventClick = (clickInfo: EventClickArg) => {
  const event = clickInfo.event
  selectedEvent.value = {
    id: event.id,
    title: event.title,
    start: event.startStr,
    end: event.endStr || undefined,
    type: event.extendedProps.type,
    backgroundColor: event.backgroundColor || '',
    borderColor: event.borderColor || '',
    description: event.extendedProps.description,
    relatedId: event.extendedProps.relatedId,
    location: event.extendedProps.location,
    participants: event.extendedProps.participants,
    status: event.extendedProps.status,
  }
  eventDialog.value = true
}

const handleDateSelect = (selectInfo: any) => {
  newEvent.value.start = selectInfo.startStr
  newEvent.value.end = selectInfo.endStr || selectInfo.startStr
  addEventDialog.value = true
}

const addNewEvent = () => {
  addEventDialog.value = false
  // In a real app, this would save to backend
  console.log('Adding new event:', newEvent.value)

  // Reset form
  newEvent.value = {
    title: '',
    start: '',
    end: '',
    type: 'meeting',
    description: '',
  }
}

const closeEventDialog = () => {
  eventDialog.value = false
  selectedEvent.value = null
}

const closeAddEventDialog = () => {
  addEventDialog.value = false
  newEvent.value = {
    title: '',
    start: '',
    end: '',
    type: 'meeting',
    description: '',
  }
}

// ── Filter Helpers ─────────────────────────────────────────
const eventTypeOptions = [
  { label: 'Zlecenia', value: 'order', color: eventTypeColors.order.bg, icon: 'tabler-clipboard-list' },
  { label: 'Terminy', value: 'deadline', color: eventTypeColors.deadline.bg, icon: 'tabler-clock-hour-4' },
  { label: 'Inspekcje', value: 'inspection', color: eventTypeColors.inspection.bg, icon: 'tabler-shield-check' },
  { label: 'Spotkania', value: 'meeting', color: eventTypeColors.meeting.bg, icon: 'tabler-users' },
  { label: 'Zadania', value: 'task', color: eventTypeColors.task.bg, icon: 'tabler-list-check' },
  { label: 'Prace terenowe', value: 'fieldwork', color: eventTypeColors.fieldwork.bg, icon: 'tabler-map-pin' },
  { label: 'Szkolenia', value: 'training', color: eventTypeColors.training.bg, icon: 'tabler-school' },
  { label: 'Raporty', value: 'report', color: eventTypeColors.report.bg, icon: 'tabler-file-text' },
]

const checkAll = computed({
  get: () => selectedFilters.value.length === eventTypeOptions.length,
  set: val => {
    if (val)
      selectedFilters.value = eventTypeOptions.map(i => i.value)
    else if (selectedFilters.value.length === eventTypeOptions.length)
      selectedFilters.value = []
  },
})

const getEventTypeLabel = (type: string) => {
  return eventTypeOptions.find(opt => opt.value === type)?.label || type
}

const jumpToDate = (date: string) => {
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    calendarApi.gotoDate(date)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-4 mb-6">
      <div>
        <div class="d-flex align-center gap-2 mb-1">
          <VIcon
            icon="tabler-calendar"
            size="28"
            color="primary"
          />
          <h4 class="text-h4">
            Kalendarz
          </h4>
        </div>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Przegladaj terminy, spotkania i wydarzenia
        </p>
      </div>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="addEventDialog = true"
      >
        Nowe Wydarzenie
      </VBtn>
    </div>

    <!-- Calendar Layout -->
    <VCard>
      <VLayout style="z-index: 0;">
        <!-- Sidebar -->
        <VNavigationDrawer
          v-model="isLeftSidebarOpen"
          width="280"
          absolute
          touchless
          location="start"
          class="calendar-sidebar"
          :temporary="$vuetify.display.mdAndDown"
        >
          <div class="pa-5">
            <VBtn
              block
              color="primary"
              prepend-icon="tabler-plus"
              @click="addEventDialog = true"
            >
              Dodaj Wydarzenie
            </VBtn>
          </div>

          <VDivider />

          <!-- Event Filters -->
          <div class="pa-5">
            <h6 class="text-h6 mb-4">
              Filtry Wydarzen
            </h6>

            <div class="d-flex flex-column">
              <VCheckbox
                v-model="checkAll"
                label="Wszystkie"
                hide-details
                class="mb-2"
              />
              <VCheckbox
                v-for="eventType in eventTypeOptions"
                :key="eventType.value"
                v-model="selectedFilters"
                :value="eventType.value"
                :color="eventType.color"
                hide-details
                class="mb-2"
              >
                <template #label>
                  <div class="d-flex align-center gap-2">
                    <VIcon
                      :icon="eventType.icon"
                      size="18"
                    />
                    {{ eventType.label }}
                  </div>
                </template>
              </VCheckbox>
            </div>
          </div>
        </VNavigationDrawer>

        <!-- Calendar Main Content -->
        <VMain>
          <VCard flat>
            <VCardText>
              <FullCalendar
                ref="calendarRef"
                :options="calendarOptions"
              />
            </VCardText>
          </VCard>
        </VMain>
      </VLayout>
    </VCard>

    <!-- Event Details Dialog -->
    <VDialog
      v-model="eventDialog"
      max-width="600"
    >
      <VCard v-if="selectedEvent">
        <VCardTitle class="d-flex align-center pa-5">
          <VAvatar
            :color="selectedEvent?.backgroundColor"
            variant="tonal"
            size="40"
            class="me-3"
          >
            <VIcon
              :icon="eventTypeOptions.find(opt => opt.value === selectedEvent?.type)?.icon || 'tabler-calendar'"
              size="24"
            />
          </VAvatar>
          <div>
            <h5 class="text-h5">
              {{ selectedEvent.title }}
            </h5>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ getEventTypeLabel(selectedEvent.type) }}
            </p>
          </div>
          <VSpacer />
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="closeEventDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <div class="d-flex flex-column gap-4">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Data
              </div>
              <div class="d-flex align-center gap-2">
                <VIcon
                  icon="tabler-calendar"
                  size="18"
                />
                {{ selectedEvent.start }}
              </div>
            </div>

            <div v-if="selectedEvent.description">
              <div class="text-caption text-medium-emphasis mb-1">
                Opis
              </div>
              <p class="mb-0">
                {{ selectedEvent.description }}
              </p>
            </div>

            <div v-if="selectedEvent.location">
              <div class="text-caption text-medium-emphasis mb-1">
                Lokalizacja
              </div>
              <div class="d-flex align-center gap-2">
                <VIcon
                  icon="tabler-map-pin"
                  size="18"
                  color="error"
                />
                {{ selectedEvent.location }}
              </div>
            </div>

            <div v-if="selectedEvent.participants && selectedEvent.participants.length > 0">
              <div class="text-caption text-medium-emphasis mb-1">
                Uczestnicy
              </div>
              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="(participant, idx) in selectedEvent.participants"
                  :key="idx"
                  size="small"
                  variant="tonal"
                  color="primary"
                >
                  <VIcon
                    icon="tabler-user"
                    size="14"
                    start
                  />
                  {{ participant }}
                </VChip>
              </div>
            </div>

            <div v-if="selectedEvent.status">
              <div class="text-caption text-medium-emphasis mb-1">
                Status
              </div>
              <VChip
                :color="selectedEvent.status === 'Potwierdzone' ? 'success' : selectedEvent.status === 'W realizacji' ? 'info' : 'warning'"
                size="small"
                variant="tonal"
              >
                <VIcon
                  :icon="selectedEvent.status === 'Potwierdzone' ? 'tabler-circle-check' : selectedEvent.status === 'W realizacji' ? 'tabler-progress' : 'tabler-clock'"
                  size="14"
                  start
                />
                {{ selectedEvent.status }}
              </VChip>
            </div>

            <div v-if="selectedEvent.relatedId">
              <div class="text-caption text-medium-emphasis mb-1">
                Powiazane ID
              </div>
              <VChip
                color="primary"
                size="small"
                variant="tonal"
              >
                #{{ selectedEvent.relatedId }}
              </VChip>
            </div>
          </div>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeEventDialog"
          >
            Zamknij
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Add Event Dialog -->
    <VDialog
      v-model="addEventDialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="d-flex align-center pa-5">
          <VAvatar
            color="primary"
            variant="tonal"
            size="40"
            class="me-3"
          >
            <VIcon
              icon="tabler-calendar-event"
              size="24"
            />
          </VAvatar>
          <div>
            <h5 class="text-h5">
              Nowe Wydarzenie
            </h5>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Dodaj nowe wydarzenie do kalendarza
            </p>
          </div>
          <VSpacer />
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="closeAddEventDialog"
          />
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <VForm @submit.prevent="addNewEvent">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="newEvent.title"
                  label="Tytul *"
                  placeholder="Wprowadz tytul wydarzenia"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="newEvent.start"
                  label="Data rozpoczecia *"
                  type="date"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="newEvent.end"
                  label="Data zakonczenia"
                  type="date"
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="newEvent.type"
                  :items="eventTypeOptions.map(opt => ({ title: opt.label, value: opt.value }))"
                  label="Typ wydarzenia *"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="newEvent.description"
                  label="Opis"
                  placeholder="Dodaj opis wydarzenia..."
                  rows="3"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeAddEventDialog"
          >
            Anuluj
          </VBtn>
          <VBtn
            color="primary"
            @click="addNewEvent"
          >
            Dodaj
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";

.calendar-sidebar {
  &.v-navigation-drawer:not(.v-navigation-drawer--temporary) {
    border-end-start-radius: 0.375rem;
    border-start-start-radius: 0.375rem;
  }

  &.v-navigation-drawer--temporary:not(.v-navigation-drawer--active) {
    transform: translateX(-110%) !important;
  }
}

.calendar-date-picker {
  :deep(.flatpickr-calendar) {
    box-shadow: none !important;
  }
}

// Enhanced contrast and readability for calendar events
:deep(.fc) {
  .fc-event {
    // Force white text on all colored event backgrounds
    color: #fff !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    // Ensure all child elements also have white text
    * {
      color: #fff !important;
    }
  }

  .fc-event-main {
    color: #fff !important;
  }

  .fc-event-title,
  .fc-event-time {
    color: #fff !important;
  }

  // List view should maintain proper contrast
  .fc-list-event-title,
  .fc-list-event-time {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity)) !important;
  }

  // Daygrid events (month view)
  .fc-daygrid-event {
    .fc-event-title,
    .fc-event-time {
      color: #fff !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }

  // Timegrid events (week/day view)
  .fc-timegrid-event {
    .fc-event-title,
    .fc-event-time {
      color: #fff !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
