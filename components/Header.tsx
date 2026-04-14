"use client";

import Link from 'next/link'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  
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
  
  return (
    <nav className="bg-gray-100 border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
        <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-primary-700 transition-colors">
          TripTailor
        </Link>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
          <Link
            href="/trips"
            className="text-gray-700 hover:text-primary-600 transition-colors">
            Explore Trips
          </Link>
          
          <Link
            href="/generate"
            className="text-gray-700 hover:text-primary-600 transition-colors">
            Generate Itinerary
          </Link>
          
          <Link
            href="/my-trips"
            className="text-gray-700 hover:text-primary-600 transition-colors">
            My Trips
          </Link>
          
        </div>
        <div className="flex items-center">
          {!loggedIn ? (
            <button
              onClick={() => {
                sessionStorage.setItem("redirect_after_login", window.location.pathname)
                router.push("/Login")
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
