import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/stores': 'Stores',
  '/stocks': 'Stocks',
  '/delivery': 'Delivery',
  '/depots': 'Depots',
}

export default function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'OOS Monitor'

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 ml-64">
      <h1 className="text-lg font-semibold text-gray-700">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Log Out
        </button>
      </div>
    </header>
  )
}
