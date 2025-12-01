'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/posts', label: 'Posts', icon: '📝' },
  { href: '/todos', label: 'Todos', icon: '✅' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuthStore()

  return (
    <div className="w-64 bg-gray-900 dark:bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col overflow-y-auto border-r border-gray-700 dark:border-gray-600">
      <div className="p-6 border-b border-gray-700 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        {user && (
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">{user.email}</p>
        )}
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto relative">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href} className="relative">
                <Link href={item.href}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer relative z-10 text-gray-300 dark:text-gray-300 hover:text-white transition-colors">
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className="absolute inset-0 bg-blue-600 dark:bg-blue-600 rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="text-xl relative z-10">{item.icon}</span>
                    <span className="relative z-10">{item.label}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 dark:border-gray-700 flex-shrink-0 space-y-2">
        <ThemeToggle />
        <button
          data-testid="logout-button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 dark:text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

