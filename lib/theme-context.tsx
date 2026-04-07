'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_KEY = 'trip-tailor-theme'

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(THEME_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw
    }
    return null
  } catch {
    return null
  }
}

function storeTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore storage errors
  }
}

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveEffectiveTheme(theme: Theme | null): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme
  return getSystemPrefersDark() ? 'dark' : 'light'
}

function applyHtmlClass(effective: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (effective === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = getStoredTheme()
    const initialEffective = resolveEffectiveTheme(stored)
    setThemeState(stored ?? 'system')
    setEffectiveTheme(initialEffective)
    applyHtmlClass(initialEffective)

    if (typeof window === 'undefined') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setEffectiveTheme((current) => {
        if (stored === 'light' || stored === 'dark') {
          applyHtmlClass(current)
          return current
        }
        const next = media.matches ? 'dark' : 'light'
        applyHtmlClass(next)
        return next
      })
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    storeTheme(next)
    const effective = resolveEffectiveTheme(next)
    setEffectiveTheme(effective)
    applyHtmlClass(effective)
  }

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

