import { useAuth } from './useAuth'
import type { UserRole } from '../types'

export function useRole() {
  const { user } = useAuth()

  const role = user?.role ?? null

  const isAdmin = role === 'admin'
  const isKepalaDistribusi = role === 'kepala_distribusi'
  const isSupervisorDistribusi = role === 'supervisor_distribusi'

  const canManageUsers = isAdmin
  const canWrite = role !== 'supervisor_distribusi'

  const hasRole = (...roles: UserRole[]) => {
    if (!role) return false
    return roles.includes(role)
  }

  return { role, isAdmin, isKepalaDistribusi, isSupervisorDistribusi, canManageUsers, canWrite, hasRole }
}
