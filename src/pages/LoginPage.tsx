import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Music } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname || ROUTES.HOME

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!identifier.trim() || !password) { setError('Please fill in all fields.'); return }
    try {
      await login(identifier.trim(), password)
      navigate(from, { replace: true })
    } catch {
      setError('Invalid email/username or password.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Music size={22} className="text-white" />
        </div>
        <h1 className="text-headline-md font-bold text-on-surface">BARZTIFY</h1>
        <p className="text-headline-sm font-semibold text-on-surface mt-1">Welcome back</p>
        <p className="text-body-sm text-on-surface-variant mt-1">Sign in to continue your session.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5 ml-1" htmlFor="identifier">
            Email or Username
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              id="identifier" type="text" value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input-field pl-10" placeholder="you@example.com or username"
              autoComplete="username email" autoCapitalize="none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-label-md text-on-surface-variant ml-1" htmlFor="password">Password</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-label-md text-primary hover:underline">Forgot Password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              id="password" type={showPass ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10 pr-10" placeholder="••••••••"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" aria-label="Toggle password">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-label-md text-error font-semibold text-center">{error}</motion.p>}

        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <>Login</>}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-label-sm text-outline uppercase tracking-widest">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Google', 'Apple'].map((p) => (
            <button key={p} disabled className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-on-surface-variant text-body-sm font-semibold disabled:opacity-40 cursor-not-allowed">
              {p}
            </button>
          ))}
        </div>
        <p className="text-label-sm text-outline text-center mt-2">OAuth integration coming soon</p>
      </div>

      <p className="text-center text-body-sm text-on-surface-variant mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">Sign Up</Link>
      </p>
    </motion.div>
  )
}
