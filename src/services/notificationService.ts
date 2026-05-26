import apiClient from '@/services/api'
import type { Notification } from '@/types'

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get('/v1/notifications')
    return data.data
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/v1/notifications/${id}/read`)
  },
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/v1/notifications/read-all')
  },
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/notifications/${id}`)
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get('/v1/notifications/unread-count')
    return data.data.count
  },
}
