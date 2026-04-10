"use client";

import Link from 'next/link'
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("access_token");
      setLoggedIn(!!token);
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    setLoggedIn(false);
    router.push("/Login");
    window.location.reload();
  }

  const linkClass = (href: string) =>
    pathname === href
      ? "text-primary-600 font-semibold"
      : "text-gray-700 hover:text-primary-600 transition-colors";

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600 tracking-tight hover:text-primary-700 transition-colors">
            TripTailor
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/trips" className={linkClass("/trips")}>Explore Trips</Link>
            <Link href="/generate" className={linkClass("/generate")}>Generate Itinerary</Link>
            {loggedIn && (<Link href="/my-trips" className={linkClass("/my-trips")}>My Trips</Link>)}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/settings" title="Settings" className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            {!loggedIn ? (
              <button onClick={() => { sessionStorage.setItem("redirect_after_login", window.location.pathname); router.push("/Login"); }} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">Sign In</button>
            ) : (
              <button onClick={logout} className="text-gray-600 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium">Sign Out</button>
            )}
          </div>
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />)}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
            <Link href="/trips" className="block text-gray-700 hover:text-primary-600 font-medium py-1" onClick={() => setMenuOpen(false)}>Explore Trips</Link>
            <Link href="/generate" className="block text-gray-700 hover:text-primary-600 font-medium py-1" onClick={() => setMenuOpen(false)}>Generate Itinerary</Link>
            {loggedIn && (<Link href="/my-trips" className="block text-gray-700 hover:text-primary-600 font-medium py-1" onClick={() => setMenuOpen(false)}>My Trips</Link>)}
            <Link href="/settings" className="block text-gray-700 hover:text-primary-600 font-medium py-1" onClick={() => setMenuOpen(false)}>Settings</Link>
            <div className="pt-2 border-t border-gray-100">
              {!loggedIn ? (
                <button onClick={() => { sessionStorage.setItem("redirect_after_login", window.location.pathname); router.push("/Login"); setMenuOpen(false); }} className="w-full bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Sign In</button>
              ) : (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-gray-600 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Sign Out</button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
