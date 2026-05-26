import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/store/notificationStore'
import { Badge } from '@/components/ui/Badge'
import { timeAgo } from '@/utils/utils'
import { ROUTES } from '@/constants/routes'
import type { Notification } from '@/types'

const TYPE_COLORS: Record<Notification['type'], string> = {
  playlist_created: 'bg-primary/20 text-primary',
  track_liked: 'bg-error/20 text-error',
  track_added: 'bg-secondary/20 text-secondary',
  login: 'bg-tertiary/20 text-tertiary',
  password_reset: 'bg-outline/20 text-outline',
  system: 'bg-surface-container-high text-on-surface-variant',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore()

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleItemClick(n: Notification) {
    if (!n.isRead) markAsRead(n.id)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative p-2"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} strokeWidth={1.8} />
        <Badge count={unreadCount} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto
                       glass-panel rounded-2xl shadow-2xl z-50 no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 glass-panel z-10">
              <span className="text-body-sm font-bold text-on-surface">Notifications</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="btn-ghost p-1.5 text-xs flex items-center gap-1 text-primary" aria-label="Mark all read">
                    <Check size={13} />
                    <span className="text-label-sm">All read</span>
                  </button>
                )}
                <button
                  onClick={() => { navigate(ROUTES.NOTIFICATIONS); setOpen(false) }}
                  className="btn-ghost p-1.5 text-label-sm text-on-surface-variant"
                >
                  See all
                </button>
              </div>
            </div>

            {/* List */}
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
                <Bell size={28} strokeWidth={1.5} className="mb-2 opacity-40" />
                <p className="text-body-sm">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 8).map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    onClick={() => handleItemClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors
                      ${!n.isRead ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${TYPE_COLORS[n.type]}`}>
                      <Bell size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-body-sm font-semibold leading-tight ${!n.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                      <p className="text-label-sm text-outline mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-label-sm text-outline/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                        className="btn-ghost p-1 opacity-0 group-hover:opacity-100"
                        aria-label="Delete"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
