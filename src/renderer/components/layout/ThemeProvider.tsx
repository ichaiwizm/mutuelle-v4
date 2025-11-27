import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  useEffect(() => {
    const root = document.documentElement

    const updateTheme = () => {
      const resolved = theme === 'system' ? getSystemTheme() : theme
      setResolvedTheme(resolved)

      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    updateTheme()
    localStorage.setItem('theme', theme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') updateTheme()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
