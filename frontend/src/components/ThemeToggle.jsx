import React, { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const ThemeToggle = () => {
  const [theme, setTheme] = useLocalStorage('zurirent_theme', 'light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const root = window.document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <button className="p-2 text-gray-600 hover:bg-secondary rounded-lg transition-colors">
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-600 hover:bg-secondary rounded-lg transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  )
}

export default ThemeToggle