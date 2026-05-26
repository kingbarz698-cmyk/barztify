import { NavLink } from 'react-router-dom'
import { Home, Search, Library, User, Music } from 'lucide-react'
import { cn } from '@/utils/utils'
import { ROUTES } from '@/constants/routes'

const NAV_ITEMS = [
  { path: ROUTES.HOME, icon: Home, label: 'Home' },
  { path: ROUTES.SEARCH, icon: Search, label: 'Search' },
  { path: ROUTES.LIBRARY, icon: Library, label: 'Library' },
  { path: ROUTES.PROFILE, icon: User, label: 'Profile' },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 glass-panel border-r border-white/5 z-40 py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
          <Music size={16} className="text-white" />
        </div>
        <span className="text-headline-sm font-bold text-on-surface tracking-tight">Barztify</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-semibold transition-all duration-150',
              isActive ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
