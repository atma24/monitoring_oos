import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/stores': 'Stores',
  '/stocks': 'Stocks',
  '/delivery': 'Delivery',
  '/depo': 'Depo',
}

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'OOS Monitor'

  return (
    <header className="pc-header">
      <div className="header-wrapper">
        <h5 className="m-0 text-heading font-medium">{title}</h5>
        <div className="ms-auto flex items-center gap-3">
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
