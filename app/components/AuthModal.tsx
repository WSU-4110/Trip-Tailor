'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext' 
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'login' | 'register'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<Tab>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setEmail('')
      setPassword('')
      setError('')
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  useEffect(() => {
  if (isOpen) {
    sessionStorage.setItem("redirect_after_login", pathname);
  }
}, [isOpen, pathname]);



  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    if (tab === 'login') {
      await login(email, password)


      
      const redirectPath =
  sessionStorage.getItem("redirect_after_login") || "/generate";

sessionStorage.removeItem("redirect_after_login");

onClose();

window.location.replace(redirectPath);

return;
    } else {
      if (!name.trim()) {
        setError('Please enter your name.')
        setLoading(false)
        return
      }

      await register(name, email, password)
      onClose()
    }

  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}





  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold">
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm">
            {tab === 'login' ? 'Sign in to access your trips and itineraries.' : 'Join TripTailor to save and generate itineraries.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'login'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError('') }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'register'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'register' ? 'At least 8 characters' : '••••••••'}
              required
              minLength={tab === 'register' ? 8 : 1}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <p className="text-center text-sm text-gray-500">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
              className="text-primary-600 font-semibold hover:underline"
            >
              {tab === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
