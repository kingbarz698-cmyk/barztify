import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function AuthUnauthorizedListener() {
  const navigate = useNavigate()
  useEffect(() => {
    const handler = () => navigate(ROUTES.LOGIN, { replace: true })
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [navigate])
  return null
}
