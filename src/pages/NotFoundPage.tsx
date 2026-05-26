import { useNavigate } from 'react-router-dom'
import { Music } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center bg-surface">
      <Music size={48} className="text-primary" strokeWidth={1.5} />
      <h1 className="text-display font-bold text-on-surface">404</h1>
      <p className="text-body-md text-on-surface-variant max-w-sm">This page doesn't exist. Maybe it's playing somewhere else.</p>
      <button onClick={() => navigate(ROUTES.HOME)} className="btn-primary mt-2">Go Home</button>
    </div>
  )
}
