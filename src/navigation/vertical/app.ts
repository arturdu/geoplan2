import type { VerticalNavItems } from '@layouts/types'

export const appNav: VerticalNavItems = [
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
    icon: { icon: 'tabler-layout-list' },
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
]
