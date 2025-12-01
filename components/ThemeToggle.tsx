'use client'

import { useThemeStore } from '@/store/themeStore'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg">
        <span className="text-xl">🌓</span>
        <span>Theme</span>
      </div>
    )
  }

  const themes: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '🌓' },
  ]

  const currentTheme = themes.find((t) => t.value === theme) || themes[2]

  return (
    <div className="relative group">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.value === theme)
          const nextIndex = (currentIndex + 1) % themes.length
          setTheme(themes[nextIndex].value)
        }}
        aria-label="Toggle theme"
        data-testid="theme-toggle"
      >
        <span className="text-xl">{currentTheme.icon}</span>
        <span className="flex-1 text-left">{currentTheme.label}</span>
        <span className="text-xs text-gray-500">Click to cycle</span>
      </button>
      
      {/* Dropdown menu on hover */}
      <div className="absolute bottom-full left-0 mb-2 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                theme === t.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {theme === t.value && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

