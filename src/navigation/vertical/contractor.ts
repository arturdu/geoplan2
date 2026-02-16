import type { VerticalNavItems } from '@layouts/types'

export const contractorNav: VerticalNavItems = [
  {
    title: 'Panel Glowny',
    to: { name: 'contractor' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Uzytkownicy',
    to: { name: 'contractor-users' },
    icon: { icon: 'tabler-users' },
  },
]
