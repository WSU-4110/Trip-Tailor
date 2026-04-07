'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, restore session from localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tt_token') : null
    if (saved) {
      setToken(saved)
      fetchMe(saved).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  async function fetchMe(tok: string) {
    try {
      const res = await fetch('/api/backend/v1/auth/me', {
        headers: { Authorization: `Bearer ${tok}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        // Token invalid or backend unavailable — clear it
        localStorage.removeItem('tt_token')
        setToken(null)
      }
    } catch {
      // Backend not running — leave token but clear user
      // so the UI degrades gracefully
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/backend/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || 'Invalid email or password.')
    }
    const data = await res.json()
    localStorage.setItem('tt_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/backend/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || 'Registration failed. Please try again.')
    }
    const data = await res.json()
    localStorage.setItem('tt_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('tt_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
