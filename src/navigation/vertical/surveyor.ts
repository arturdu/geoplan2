import type { VerticalNavItems } from '@layouts/types'

export const surveyorNav: VerticalNavItems = [
  {
    title: 'Panel Glowny',
    to: { name: 'surveyor' },
    icon: { icon: 'tabler-smart-home' },
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
    title: 'Uzytkownicy',
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
        title: 'Typy Robot',
        to: { name: 'surveyor-works' },
        icon: { icon: 'tabler-tool' },
      },
    ],
  },
]
