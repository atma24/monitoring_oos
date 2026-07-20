import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f7fa' }}>
      <div className="bg-white p-8 w-full max-w-md shadow-[0_1px_20px_0_rgba(69,90,100,0.08)]" style={{ borderRadius: 0 }}>
        <h1 className="text-xl font-light text-center mb-1" style={{ color: '#3f4d67' }}>OOS Monitor</h1>
        <p className="text-xs text-center text-[#8996a4] mb-6">Sign in to continue</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-[#262626] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#262626] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-none px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ background: '#04a9f5' }}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
