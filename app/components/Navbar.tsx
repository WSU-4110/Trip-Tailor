'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import { useRouter } from "next/navigation";

interface NavbarProps {
  activePage?: 'home' | 'trips' | 'generate'
}

export default function Navbar({ activePage }: NavbarProps) {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter();

  const linkClass = (page: string) =>
    activePage === page
      ? 'text-primary-600 font-semibold'
      : 'text-gray-700 hover:text-primary-600 transition-colors'

  return (
    <>
      <nav className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600 tracking-tight">
            TripTailor
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/trips" className={linkClass('trips')}>
              Find Trips
            </Link>
            <Link href="/generate" className={linkClass('generate')}>
              Generate Itinerary
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hey, <span className="font-semibold text-gray-800">{user.name.split(' ')[0]}</span>!
                </span>
                <button
                  onClick={logout}
                  className="text-gray-600 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                sessionStorage.setItem("redirect_after_login", window.location.pathname);
                router.push("/Login");
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
            <Link href="/trips" className="block text-gray-700 hover:text-primary-600 font-medium py-1" onClick={() => setMenuOpen(false)}>
              Find Trips
            </Link>
            <Link href="/generate" className="block text-gray-700 hover:text-primary-600 font-medium py-1" onClick={() => setMenuOpen(false)}>
              Generate Itinerary
            </Link>
            {user ? (
              <>
                <p className="text-sm text-gray-500">Signed in as <span className="font-semibold">{user.email}</span></p>
                <button onClick={() => { logout(); setMenuOpen(false) }} className="text-red-600 font-medium text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                sessionStorage.setItem("redirect_after_login", window.location.pathname);
                router.push("/Login");
                }}
                className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>

    </>
  )
}
