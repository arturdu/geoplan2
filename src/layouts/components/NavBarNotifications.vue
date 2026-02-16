<script lang="ts" setup>
import type { Notification } from '@layouts/types'

const notifications = ref<Notification[]>([
  {
    id: 1,
    title: 'Nowe zlecenie ZLC/2025/0142',
    subtitle: 'Otrzymales nowe zlecenie do realizacji',
    time: 'Dzisiaj',
    isSeen: false,
    text: 'RM',
  },
  {
    id: 2,
    title: 'Zmiana statusu zlecenia',
    subtitle: 'ZLC/2025/0098 zmieniono na "Wykonane"',
    time: 'Dzisiaj',
    isSeen: false,
    text: 'JK',
  },
  {
    id: 3,
    title: 'Nowy plik dodany',
    subtitle: 'Dodano plik pomiar_045.pdf do zlecenia',
    time: 'Wczoraj',
    isSeen: false,
    text: 'PN',
  },
  {
    id: 4,
    title: 'Termin zlecenia',
    subtitle: 'Zbliia sie termin realizacji ZLC/2025/0120',
    time: 'Wczoraj',
    isSeen: true,
    color: 'warning',
    text: 'SYS',
  },
  {
    id: 5,
    title: 'Inspekcja zatwierdzona',
    subtitle: 'Inspektor zatwierdzil zlecenie ZLC/2025/0087',
    time: '2 dni temu',
    isSeen: true,
    text: 'WB',
  },
])

const removeNotification = (notificationId: number) => {
  notifications.value.forEach((item, index) => {
    if (notificationId === item.id)
      notifications.value.splice(index, 1)
  })
}

const markRead = (notificationId: number[]) => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isSeen = true
    })
  })
}

const markUnRead = (notificationId: number[]) => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isSeen = false
    })
  })
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.isSeen)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
