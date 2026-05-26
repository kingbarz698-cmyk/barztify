import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Library, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'
import { ROUTES } from '@/constants/routes'

const NAV_ITEMS = [
  { path: ROUTES.HOME, icon: Home, label: 'Home' },
  { path: ROUTES.SEARCH, icon: Search, label: 'Search' },
  { path: ROUTES.LIBRARY, icon: Library, label: 'Library' },
  { path: ROUTES.PROFILE, icon: User, label: 'Profile' },
]

export function BottomNav() {
  const location = useLocation()
  return (
    <nav
      className="md:hidden fixed nav-safe-bottom left-1/2 -translate-x-1/2
                 w-[calc(100%-32px)] max-w-[420px] h-[60px] z-50
                 glass-nav rounded-full
                 flex items-center justify-around px-2
                 shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path
        return (
          <NavLink
            key={path}
            to={path}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 px-4 rounded-full min-w-[60px] touch-target transition-colors duration-200',
              isActive ? 'text-primary' : 'text-on-surface-variant'
            )}
            aria-label={label}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-wide leading-none">{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
