import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  getEffectiveTheme: () => 'light' | 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },
      getEffectiveTheme: () => {
        const { theme } = get()
        if (theme === 'system') {
          if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
          }
          return 'light' // Default to light if matchMedia is not available
        }
        return theme
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Apply theme on hydration
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined' || !window.document) {
    return
  }
  
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    if (window.matchMedia) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add('light') // Default to light if matchMedia is not available
    }
  } else {
    root.classList.add(theme)
  }
}

// Initialize theme on load (client-side only)
if (typeof window !== 'undefined' && window.matchMedia) {
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState()
    if (store.theme === 'system') {
      applyTheme('system')
    }
  })
}

