import { User, LogOut, Bell, Shield, Music, ChevronRight, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const MENU_ITEMS = [
    { icon: Bell, label: 'Notifications', onClick: () => navigate(ROUTES.NOTIFICATIONS) },
    { icon: Shield, label: 'Privacy & Security', onClick: () => {} },
    { icon: Music, label: 'Audio Quality', onClick: () => {} },
  ]

  return (
    <div className="nav-safe-padding px-5">
      {/* Header */}
      <div className="pt-8 pb-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-xl shadow-primary/20"
        >
          {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
        </motion.div>
        <h1 className="text-headline-sm font-bold text-on-surface">{user?.name}</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">{user?.email}</p>
        {user?.isPremium && (
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30">
            <Crown size={13} className="text-tertiary" />
            <span className="text-label-md text-tertiary font-semibold">Premium</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label: 'Playlists', value: '12' }, { label: 'Liked Songs', value: '47' }, { label: 'Following', value: '8' }].map((s) => (
          <div key={s.label} className="surface-card p-3 text-center">
            <p className="text-headline-sm font-bold text-on-surface">{s.value}</p>
            <p className="text-label-sm text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-2 mb-6">
        {MENU_ITEMS.map(({ icon: Icon, label, onClick }) => (
          <button key={label} onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl surface-card hover:bg-white/5 active:bg-white/10 transition-colors text-left">
            <Icon size={18} strokeWidth={1.8} className="text-on-surface-variant" />
            <span className="flex-1 text-body-sm font-semibold text-on-surface">{label}</span>
            <ChevronRight size={16} className="text-outline" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate(ROUTES.LOGIN) }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-error/20 text-error text-body-sm font-semibold hover:bg-error/8 active:bg-error/12 transition-colors"
      >
        <LogOut size={18} strokeWidth={1.8} /> Sign Out
      </button>
    </div>
  )
}
