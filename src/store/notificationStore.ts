import { create } from 'zustand'
import type { Notification } from '@/types'

// Local mock notifications — replaced by real API when backend connected
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Welcome to Barztify', message: 'Start exploring premium music experience.', type: 'system', isRead: false, createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: '2', title: 'Playlist created', message: '"Nightfall Vibes" has been created successfully.', type: 'playlist_created', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: 'New login detected', message: 'A new login was detected on your account.', type: 'login', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Track added to favorites', message: '"Midnight Bloom" was added to your liked songs.', type: 'track_liked', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
]

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  setNotifications: (n: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  addNotification: (n: Notification) => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,
  isLoading: false,

  setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length }),

  markAsRead: (id) => {
    const { notifications } = get()
    const updated = notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
    set({ notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length })
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }))
    set({ notifications: updated, unreadCount: 0 })
  },

  deleteNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id)
    set({ notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length })
  },

  addNotification: (n) => {
    const updated = [n, ...get().notifications]
    set({ notifications: updated, unreadCount: updated.filter((x) => !x.isRead).length })
  },
}))
