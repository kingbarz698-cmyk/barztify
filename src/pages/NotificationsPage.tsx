import { Bell, Check, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationSkeleton } from '@/components/loading/Skeleton'
import { timeAgo } from '@/utils/utils'
import type { Notification } from '@/types'

const TYPE_ICONS: Record<Notification['type'], string> = {
  playlist_created: '🎵', track_liked: '♥', track_added: '+', login: '→', password_reset: '🔒', system: '•',
}

export function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotificationStore()

  return (
    <div className="nav-safe-padding">
      <header className="glass-top sticky top-0 z-40 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h1 className="text-headline-sm font-bold text-on-surface">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-label-md text-primary font-semibold">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="mt-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-3">
            <Bell size={40} strokeWidth={1.5} className="opacity-40" />
            <p className="text-body-sm">No notifications yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id} layout
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`group flex items-start gap-3 px-5 py-4 border-b border-white/5 cursor-pointer transition-colors
                  ${!n.isRead ? 'bg-primary/5' : 'hover:bg-white/5'}`}
              >
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold
                  ${!n.isRead ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  <Bell size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-body-sm font-semibold leading-tight ${!n.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                  <p className="text-label-sm text-outline mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-label-sm text-outline/60 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                    className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
