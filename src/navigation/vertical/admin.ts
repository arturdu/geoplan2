import type { VerticalNavItems } from '@layouts/types'

export const adminNav: VerticalNavItems = [
  {
    title: 'Panel Glowny',
    to: { name: 'admin' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Wykonawcy Geodezyjni',
    to: { name: 'admin-teams' },
    icon: { icon: 'tabler-users-group' },
  },
  {
    title: 'Inspektorzy',
    to: { name: 'admin-inspectors' },
    icon: { icon: 'tabler-shield-check' },
  },
]
