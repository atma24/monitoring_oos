import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      client.get<User>('/user')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await client.post<{ token: string; user: User }>('/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await client.post('/logout') } catch {}
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }, [])

  return { user, loading, login, logout }
}
