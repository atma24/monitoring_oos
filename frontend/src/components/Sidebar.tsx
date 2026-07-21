import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, Package, Truck, Warehouse } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Store, label: 'Stores', to: '/stores' },
  { icon: Package, label: 'Stocks', to: '/stocks' },
  { icon: Truck, label: 'Delivery', to: '/delivery' },
  { icon: Warehouse, label: 'Depo', to: '/depo' },
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
            const Icon = item.icon
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            return (
              <li key={item.to} className={`pc-item ${isActive ? 'active' : ''}`}>
                <NavLink to={item.to} className="pc-link">
                  <span className="pc-micon"><Icon size={18} /></span>
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
