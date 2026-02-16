import type { VerticalNavItems } from '@layouts/types'

const unifiedNav: VerticalNavItems = [
  // ── KSIĄŻKA ZLECEŃ ──
  { heading: 'KSIĄŻKA ZLECEŃ' },
  {
    title: 'Panel Główny',
    icon: { icon: 'tabler-smart-home' },
    children: [
      {
        title: 'Główny',
        to: { name: 'root' },
        icon: { icon: 'tabler-layout-dashboard' },
      },
      {
        title: 'Kontrola Operacji',
        to: { name: 'operations-control' },
        icon: { icon: 'tabler-radar' },
      },
      {
        title: 'Zarządzanie Zleceniami',
        to: { name: 'orders-kanban' },
        icon: { icon: 'tabler-layout-kanban' },
      },
      {
        title: 'Analityka',
        to: { name: 'analytics-executive' },
        icon: { icon: 'tabler-chart-line' },
      },
      {
        title: 'Przegląd Mapowy',
        to: { name: 'map-overview' },
        icon: { icon: 'tabler-map-2' },
      },
    ],
  },
  {
    title: 'Książka Zleceń',
    to: { name: 'orders' },
    icon: { icon: 'tabler-clipboard-list' },
  },
  {
    title: 'Kalendarz',
    to: { name: 'calendar' },
    icon: { icon: 'tabler-calendar' },
  },
  {
    title: 'Zasoby',
    icon: { icon: 'tabler-folder' },
    children: [
      {
        title: 'Pliki',
        to: { name: 'files' },
        icon: { icon: 'tabler-file' },
      },
      {
        title: 'Linki',
        to: { name: 'links' },
        icon: { icon: 'tabler-link' },
      },
      {
        title: 'Fabryka Pomysłów',
        to: { name: 'ideas' },
        icon: { icon: 'tabler-bulb' },
      },
      {
        title: 'Geo Fun',
        to: { name: 'posts' },
        icon: { icon: 'tabler-news' },
      },
      {
        title: 'Operaty',
        to: { name: 'surveys' },
        icon: { icon: 'tabler-file-certificate' },
      },
    ],
  },
  {
    title: 'Asortyment',
    to: { name: 'asgroups' },
    icon: { icon: 'tabler-map-pin' },
  },
  {
    title: 'Branże',
    to: { name: 'trades' },
    icon: { icon: 'tabler-tag' },
  },
  {
    title: 'Typy',
    to: { name: 'types' },
    icon: { icon: 'tabler-flag' },
  },

  // ── PANEL GEODETY ──
  { heading: 'PANEL GEODETY' },
  {
    title: 'Panel Główny',
    to: { name: 'surveyor' },
    icon: { icon: 'tabler-map-2' },
  },
  {
    title: 'Kontrakty',
    to: { name: 'surveyor-projects' },
    icon: { icon: 'tabler-bookmark' },
    badgeContent: '8',
    badgeClass: 'bg-success',
  },
  {
    title: 'Wykonawcy',
    to: { name: 'surveyor-contractors' },
    icon: { icon: 'tabler-users-group' },
    badgeContent: '5',
    badgeClass: 'bg-info',
  },
  {
    title: 'Użytkownicy',
    to: { name: 'surveyor-users' },
    icon: { icon: 'tabler-users' },
    badgeContent: '30',
    badgeClass: 'bg-primary',
  },
  {
    title: 'EDZRG',
    icon: { icon: 'tabler-clipboard-list' },
    children: [
      {
        title: 'Zlecenia',
        to: { name: 'surveyor-tasks' },
        icon: { icon: 'tabler-list-check' },
      },
      {
        title: 'Klienci',
        to: { name: 'surveyor-clients' },
        icon: { icon: 'tabler-address-book' },
      },
      {
        title: 'Typy Robót',
        to: { name: 'surveyor-works' },
        icon: { icon: 'tabler-tool' },
      },
    ],
  },

  // ── PANEL WYKONAWCY ──
  { heading: 'PANEL WYKONAWCY' },
  {
    title: 'Panel Główny',
    to: { name: 'contractor' },
    icon: { icon: 'tabler-building' },
  },
  {
    title: 'Użytkownicy',
    to: { name: 'contractor-users' },
    icon: { icon: 'tabler-users' },
  },

  // ── ADMINISTRACJA ──
  { heading: 'ADMINISTRACJA' },
  {
    title: 'Panel Główny',
    to: { name: 'admin' },
    icon: { icon: 'tabler-shield-lock' },
  },
  {
    title: 'Wykonawcy Geodezyjni',
    to: { name: 'admin-teams' },
    icon: { icon: 'tabler-building-community' },
  },
  {
    title: 'Inspektorzy',
    to: { name: 'admin-inspectors' },
    icon: { icon: 'tabler-shield-check' },
  },
]

export default unifiedNav
