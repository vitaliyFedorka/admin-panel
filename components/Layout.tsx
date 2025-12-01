'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, isHydrated])

  // Don't render anything until hydrated to avoid flash of wrong content
  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        {children}
      </main>
    </div>
  )
}

