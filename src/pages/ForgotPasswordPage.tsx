import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import apiClient from '@/services/api'
import { ROUTES } from '@/constants/routes'

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!identifier.trim()) { setError('Please enter your email or username.'); return }
    setIsLoading(true)
    try {
      await apiClient.post('/v1/forgot-password', { identifier: identifier.trim() })
      setSent(true)
    } catch {
      // Always show "sent" — don't reveal if email exists
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <CheckCircle size={48} className="text-secondary mx-auto mb-4" strokeWidth={1.5} />
      <h2 className="text-headline-sm font-bold text-on-surface mb-2">Check your email</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">
        If an account exists for <strong>{identifier}</strong>, you'll receive a reset link within a few minutes. Check your spam folder too.
      </p>
      <Link to={ROUTES.LOGIN} className="btn-primary inline-flex">Back to Login</Link>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 text-body-sm">
        <ArrowLeft size={16} /> Back to Login
      </Link>
      <h2 className="text-headline-sm font-bold text-on-surface mb-2">Forgot Password?</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">Enter your email or username and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5 ml-1" htmlFor="identifier">Email or Username</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              className="input-field pl-10" placeholder="you@example.com or username" autoCapitalize="none" />
          </div>
        </div>
        {error && <p className="text-label-md text-error font-semibold text-center">{error}</p>}
        <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
          {isLoading ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
        </button>
      </form>
    </motion.div>
  )
}
