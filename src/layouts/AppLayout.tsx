import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MiniPlayer } from '@/components/player/MiniPlayer'
import { NowPlaying } from '@/components/player/NowPlaying'
import { DesktopPlayer } from '@/components/player/DesktopPlayer'
import { usePlayer } from '@/hooks/usePlayer'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}

export function AppLayout() {
  const location = useLocation()
  usePlayer()

  return (
    <div className="flex h-[100dvh] bg-surface overflow-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-60 md:mb-20 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="md:hidden"><MiniPlayer /></div>
      <BottomNav />
      <div className="hidden md:block"><DesktopPlayer /></div>
      <NowPlaying />
    </div>
  )
}
