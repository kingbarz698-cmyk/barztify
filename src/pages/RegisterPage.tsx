import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Music } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    try {
      await register(name, email, password)
      navigate(ROUTES.HOME)
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Music size={22} className="text-white" />
        </div>
        <h1 className="text-headline-md font-bold text-on-surface">BARZTIFY</h1>
        <p className="text-headline-sm font-semibold text-on-surface mt-1">Create account</p>
        <p className="text-body-sm text-on-surface-variant mt-1">Start your free music journey today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { id: 'name', label: 'Full Name', value: name, setValue: setName, icon: User, placeholder: 'Jacob Alexandro', type: 'text' },
          { id: 'email', label: 'Email', value: email, setValue: setEmail, icon: Mail, placeholder: 'you@example.com', type: 'email' },
        ].map(({ id, label, value, setValue, icon: Icon, placeholder, type }) => (
          <div key={id}>
            <label className="block text-label-md text-on-surface-variant mb-1.5 ml-1" htmlFor={id}>{label}</label>
            <div className="relative">
              <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input id={id} type={type} value={value} onChange={(e) => setValue(e.target.value)}
                className="input-field pl-10" placeholder={placeholder} />
            </div>
          </div>
        ))}

        {[
          { id: 'password', label: 'Password', value: password, setValue: setPassword },
          { id: 'confirm', label: 'Confirm Password', value: confirm, setValue: setConfirm },
        ].map(({ id, label, value, setValue }) => (
          <div key={id}>
            <label className="block text-label-md text-on-surface-variant mb-1.5 ml-1" htmlFor={id}>{label}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
              <input id={id} type={showPass ? 'text' : 'password'} value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input-field pl-10 pr-10" placeholder="••••••••" autoComplete="new-password" />
              {id === 'password' && (
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" aria-label="Toggle">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-label-md text-error font-semibold text-center">{error}</motion.p>}

        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2 disabled:opacity-60">
          {isLoading ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-body-sm text-on-surface-variant mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">Sign In</Link>
      </p>
    </motion.div>
  )
}
