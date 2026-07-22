import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/stores': 'Stores',
  '/stocks': 'Stocks',
  '/delivery': 'Delivery',
  '/depo': 'Depo',
  '/users': 'Users',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  kepala_distribusi: 'Kep. Distribusi',
  supervisor_distribusi: 'Sup. Distribusi',
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  kepala_distribusi: 'bg-blue-100 text-blue-800',
  supervisor_distribusi: 'bg-gray-100 text-gray-800',
}

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'OOS Monitor'
  const roleLabel = user?.role ? roleLabels[user.role] : ''
  const roleColor = user?.role ? roleColors[user.role] : ''

  return (
    <header className="pc-header">
      <div className="header-wrapper">
        <h5 className="m-0 text-heading font-medium">{title}</h5>
        <div className="ms-auto flex items-center gap-3">
          {roleLabel && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor}`}>
              {roleLabel}
            </span>
          )}
          <span className="text-sm text-body">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-body bg-white/80 border border-border rounded hover:bg-gray-50 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
