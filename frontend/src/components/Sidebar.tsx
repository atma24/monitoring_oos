import { NavLink } from 'react-router-dom'

const navItems = [
  { icon: '📊', label: 'Dashboard', to: '/' },
  { icon: '🏪', label: 'Stores', to: '/stores' },
  { icon: '📦', label: 'Stocks', to: '/stocks' },
  { icon: '🚚', label: 'Delivery', to: '/delivery' },
  { icon: '🏭', label: 'Depots', to: '/depots' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-blue-600">OOS Monitor</span>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
