'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import {
  SquaresFour,
  Users as UsersIcon,
  Notebook,
  CheckSquare,
  SignOut,
} from '@phosphor-icons/react'
import ThemeToggle from './ThemeToggle'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: SquaresFour },
  { href: '/users', label: 'Users', icon: UsersIcon },
  { href: '/posts', label: 'Posts', icon: Notebook },
  { href: '/todos', label: 'Todos', icon: CheckSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuthStore()

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 flex flex-col overflow-y-auto border-r border-sidebar-border/10">
      <div className="p-6 border-b border-sidebar-border/10 flex-shrink-0 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sidebar-accent to-emerald-700 flex items-center justify-center shadow-glow">
          <span className="font-mono text-sm font-bold text-sidebar">A</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-white leading-tight">Admin Panel</h1>
          {user && (
            <p className="text-xs text-sidebar-foreground/60 truncate mt-0.5">{user.email}</p>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto relative">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href} className="relative">
                <Link href={item.href}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer relative z-10 text-sidebar-foreground/70 hover:text-white transition-colors">
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className="absolute inset-0 bg-sidebar-accent/15 border border-sidebar-accent/30 rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={18}
                      weight={isActive ? 'fill' : 'regular'}
                      className={`relative z-10 flex-shrink-0 ${isActive ? 'text-sidebar-accent' : ''}`}
                    />
                    <span className={`relative z-10 text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-sidebar-border/10 flex-shrink-0 space-y-1">
        <ThemeToggle />
        <button
          data-testid="logout-button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        >
          <SignOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
