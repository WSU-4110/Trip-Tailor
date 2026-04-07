'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type TripListItem = {
  id: string
  title: string
  destination_city: string
  destination_region: string | null
  start_date: string
  end_date: string
  trip_days: number
  status: string
  created_at: string
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }

  const startFormatted = startDate.toLocaleDateString('en-US', options)
  const endFormatted = endDate.toLocaleDateString('en-US', options)

  return `${startFormatted} – ${endFormatted}`
}

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/Login");
    }
  }, []);

  useEffect(() => {
    async function loadTrips(){
      try {
        setIsLoading(true)
        setLoadError(null)

        const res = await fetch('http://localhost:5050/api/v1/trips')

        if (!res.ok){
          throw new Error('Failed to load trips')
        }

        const data = await res.json()
        setTrips(data)
      } catch (err) {
        console.error(err)
        setLoadError(err instanceof Error ? err.message: 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrips()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Trips</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your saved itineraries. Click a trip to view or continue editing.
        </p>

        {isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center text-gray-600 dark:text-gray-300 dark:border dark:border-slate-700">
            Loading your trips...
          </div>
        ) : loadError ? (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-red-700 dark:text-red-200">
            Failed to load trips. Please try again.
            <div className="mt-2 text-sm">{loadError}</div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center dark:border dark:border-slate-700">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No trips yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">
              Create your first itinerary and it will appear here.
            </p>
            <Link
              href="/generate"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Create your first trip
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {trips.map((trip) => {
              return (
                <li key={trip.id}>
                  <Link
                    href={`/trip/${trip.id}`}
                    className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100 dark:border-slate-700"
                  >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{trip.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {trip.trip_days} day{trip.trip_days !== 1 ? 's' : ''}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
