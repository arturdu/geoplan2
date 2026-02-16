import { defineStore } from 'pinia'
import type { PanelType } from '@/types'

export const usePanelStore = defineStore('panel', () => {
  const route = useRoute()
  const router = useRouter()

  const currentTeamId = ref(1)
  const teams = ref([
    { id: 1, name: 'Geoplan Krakow', short: 'GK' },
    { id: 2, name: 'GeoService Warszawa', short: 'GS' },
    { id: 3, name: 'MeasurePro Gdansk', short: 'MP' },
  ])

  const currentPanel = computed<PanelType>(() => {
    const path = route.path
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/contractor')) return 'contractor'
    if (path.startsWith('/surveyor')) return 'surveyor'
    return 'app'
  })

  const panelColor = computed(() => {
    const colors: Record<PanelType, string> = {
      app: '#7367F0',
      surveyor: '#28C76F',
      contractor: '#FF9F43',
      admin: '#FF4C51',
    }
    return colors[currentPanel.value]
  })

  const panelLabel = computed(() => {
    const labels: Record<PanelType, string> = {
      app: 'Ksiazka Zlecen',
      surveyor: 'Panel Geodety',
      contractor: 'Panel Wykonawcy',
      admin: 'Panel Admina',
    }
    return labels[currentPanel.value]
  })

  const currentTeam = computed(() =>
    teams.value.find(t => t.id === currentTeamId.value),
  )

  function switchTeam(teamId: number) {
    currentTeamId.value = teamId
  }

  function switchPanel(panel: PanelType) {
    const routes: Record<PanelType, string> = {
      app: '/',
      surveyor: '/surveyor',
      contractor: '/contractor',
      admin: '/admin',
    }
    router.push(routes[panel])
  }

  return {
    currentPanel,
    panelColor,
    panelLabel,
    currentTeamId,
    currentTeam,
    teams,
    switchTeam,
    switchPanel,
  }
})
