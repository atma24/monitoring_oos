import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-body">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Sidebar />
      <Header />
      <div className="pc-container">
        <div className="pc-content">
          <Outlet />
        </div>
      </div>
    </>
  )
}
