import { useState, useEffect, useCallback } from 'react'
import { mockApi } from '../lib/mock-data'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setUser({ id: 1, name: 'Admin OOS', email: 'admin@oos.com' })
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await mockApi.login(email, password)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }, [])

  return { user, loading, login, logout }
}
