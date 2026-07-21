import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { icon: '📊', label: 'Dashboard', to: '/' },
  { icon: '🏪', label: 'Stores', to: '/stores' },
  { icon: '📦', label: 'Stocks', to: '/stocks' },
  { icon: '🚚', label: 'Delivery', to: '/delivery' },
  { icon: '🏭', label: 'Depo', to: '/depo' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="pc-sidebar">
      <div className="m-header">
        <span className="text-white text-lg font-light tracking-wide">OOS Monitor</span>
      </div>
      <div className="navbar-content">
        <ul className="pc-navbar">
          {navItems.map((item) => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            return (
              <li key={item.to} className={`pc-item ${isActive ? 'active' : ''}`}>
                <NavLink to={item.to} className="pc-link">
                  <span className="pc-micon">{item.icon}</span>
                  <span className="pc-mtext">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
