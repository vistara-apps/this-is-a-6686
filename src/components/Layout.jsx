import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  Home, 
  BookOpen, 
  Lightbulb, 
  User, 
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Topics', href: '/app/topics', icon: BookOpen },
    { name: 'My Insights', href: '/app/insights', icon: Lightbulb },
    { name: 'Profile', href: '/app/profile', icon: User },
  ]

  const isActive = (href) => {
    if (href === '/app') return location.pathname === '/app'
    return location.pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen bg-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-primary-600">Reddit Digest</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive(item.href) 
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} className="mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {user?.email}
            </div>
          </div>
          <div className="mb-4">
            <ConnectButton />
          </div>
          <button
            onClick={signOut}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-surface border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Your curated Reddit insights, distilled
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout