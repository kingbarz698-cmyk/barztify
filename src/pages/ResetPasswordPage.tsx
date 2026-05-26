import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import apiClient from '@/services/api'
import { ROUTES } from '@/constants/routes'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!token) return (
    <div className="text-center">
      <XCircle size={48} className="text-error mx-auto mb-4" strokeWidth={1.5} />
      <h2 className="text-headline-sm font-bold text-on-surface mb-2">Invalid Link</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">This reset link is invalid or has expired.</p>
      <Link to={ROUTES.FORGOT_PASSWORD} className="btn-primary inline-flex">Request New Link</Link>
    </div>
  )

  if (success) return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <CheckCircle size={48} className="text-secondary mx-auto mb-4" strokeWidth={1.5} />
      <h2 className="text-headline-sm font-bold text-on-surface mb-2">Password Updated</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">Your password has been reset successfully.</p>
      <button onClick={() => navigate(ROUTES.LOGIN)} className="btn-primary">Go to Login</button>
    </motion.div>
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setIsLoading(true)
    try {
      await apiClient.post('/v1/reset-password', { token, password })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Reset link expired or invalid. Please request a new one.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-headline-sm font-bold text-on-surface mb-2">Set New Password</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: 'password', label: 'New Password', value: password, setValue: setPassword },
          { id: 'confirm', label: 'Confirm Password', value: confirm, setValue: setConfirm },
        ].map(({ id, label, value, setValue }) => (
          <div key={id}>
            <label className="block text-label-md text-on-surface-variant mb-1.5 ml-1" htmlFor={id}>{label}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input id={id} type="password" value={value} onChange={(e) => setValue(e.target.value)}
                className="input-field pl-10" placeholder="••••••••" autoComplete="new-password" />
            </div>
          </div>
        ))}
        {error && <p className="text-label-md text-error font-semibold text-center">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
          {isLoading ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </motion.div>
  )
}
