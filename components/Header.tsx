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
    <nav className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          TripTailor
        </Link>
        
        <div className="flex items-center gap-6">
          <Link
            href="/trips"
            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Explore Trips
          </Link>
          
          <Link
            href="/generate"
            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Generate Itinerary
          </Link>
          
          <Link
            href="/my-trips"
            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            My Trips
          </Link>
          



          {!loggedIn ? (
            <Link
              href="/Login"
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={logout}
              className="bg-red-500 dark:bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          )}
           
          
        </div>
      </div>
    </nav>
  )
}
