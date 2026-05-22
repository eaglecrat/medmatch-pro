import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { Bell, MessageSquare, Menu, X, Shield, Stethoscope, Building2 } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-medical-600" />
                <span className="text-xl font-bold text-gray-900">MedMatch Pro</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/jobs" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Find Jobs
              </Link>
              <Link to="/providers" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Find Providers
              </Link>

              {user ? (
                <>
                  <Link to="/messages" className="relative text-gray-700 hover:text-primary-600 p-2">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                  <Link to="/dashboard" className="relative text-gray-700 hover:text-primary-600 p-2">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 ml-4">
                    {user.role === 'PROVIDER' ? (
                      <Stethoscope className="h-5 w-5 text-medical-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.providerProfile?.firstName || user.employerProfile?.companyName || user.email}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/jobs" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Find Jobs</Link>
              <Link to="/providers" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Find Providers</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Dashboard</Link>
                  <Link to="/messages" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Messages</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>HIPAA Compliant Medical Staffing Platform</p>
          <p className="mt-1">All data is encrypted and protected under federal healthcare privacy laws</p>
        </div>
      </footer>
    </div>
  )
}
