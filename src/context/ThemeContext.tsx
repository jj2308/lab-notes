import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark' // The resolved theme (light/dark only)
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('lab-theme')
      return (saved as Theme) || 'light'
    } catch {
      return 'light'
    }
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Determine actual theme based on setting
  useEffect(() => {
    if (theme === 'auto') {
      // Use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setActualTheme(mediaQuery.matches ? 'dark' : 'light')
      
      const handleChange = (e: MediaQueryListEvent) => {
        setActualTheme(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      setActualTheme(theme)
    }
  }, [theme])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [actualTheme])

  // Save theme preference
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem('lab-theme', newTheme)
    } catch {
      // Ignore localStorage errors
    }
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      actualTheme,
      setTheme: handleSetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}