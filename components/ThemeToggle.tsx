'use client'

import { useThemeStore } from '@/store/themeStore'
import { useEffect, useState } from 'react'
import { Sun, Moon, Desktop, Check } from '@phosphor-icons/react'

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Desktop },
  ]

  if (!mounted) {
    return (
      <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg">
        <Desktop size={18} className="text-sidebar-foreground/70" />
        <span className="text-sm font-medium text-sidebar-foreground/70">Theme</span>
      </div>
    )
  }

  const currentTheme = themes.find((t) => t.value === theme) || themes[2]
  const CurrentIcon = currentTheme.icon

  return (
    <div className="relative group">
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.value === theme)
          const nextIndex = (currentIndex + 1) % themes.length
          setTheme(themes[nextIndex].value)
        }}
        aria-label="Toggle theme"
        data-testid="theme-toggle"
      >
        <CurrentIcon size={18} />
        <span className="flex-1 text-left text-sm font-medium">{currentTheme.label}</span>
      </button>

      {/* Dropdown menu on hover */}
      <div className="absolute bottom-full left-0 mb-2 w-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-sidebar rounded-lg shadow-xl border border-sidebar-border/10 overflow-hidden">
          {themes.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                  theme === t.value
                    ? 'bg-sidebar-accent/15 text-sidebar-accent'
                    : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{t.label}</span>
                {theme === t.value && <Check size={14} weight="bold" className="ml-auto" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
