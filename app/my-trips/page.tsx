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
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${startDate.toLocaleDateString('en-US', options)} – ${endDate.toLocaleDateString('en-US', options)}`
}

export default function MyTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<TripListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) router.push('/Login')
  }, [])

  useEffect(() => {
    async function loadTrips() {
      try {
        setIsLoading(true)
        setLoadError(null)
        const token = localStorage.getItem('access_token')
        const res = await fetch('http://localhost:5050/api/v1/trips', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) throw new Error('Failed to load trips')
        const data = await res.json()
        setTrips(data)
      } catch (err) {
        console.error(err)
        setLoadError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }
    loadTrips()
  }, [])

  async function handleDelete(e: React.MouseEvent, tripId: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this trip? This cannot be undone.')) return
    try {
      setDeletingId(tripId)
      const token = localStorage.getItem('access_token')
      const res = await fetch(`http://localhost:5050/api/v1/trips/${tripId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete trip')
      setTrips((prev) => prev.filter((t) => t.id !== tripId))
    } catch (err) {
      console.error(err)
      alert('Could not delete the trip. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
        <p className="text-gray-600 mb-8">Your saved itineraries. Click a trip to view or continue editing.</p>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-600">
            <svg className="animate-spin w-8 h-8 text-primary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading your trips…
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            Failed to load trips. Please try again.
            <div className="mt-2 text-sm">{loadError}</div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">Create your first itinerary and it will appear here.</p>
            <Link href="/generate" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Create your first trip
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {trips.map((trip) => (
              <li key={trip.id} className="relative group">
                <Link href={`/trip/${trip.id}`} className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 pr-8">{trip.title}</h2>
                  <p className="text-sm text-gray-500 mb-1">{formatDateRange(trip.start_date, trip.end_date)}</p>
                  <p className="text-sm text-gray-600">
                    {trip.trip_days} day{trip.trip_days !== 1 ? 's' : ''}
                    {trip.destination_city ? ` · ${trip.destination_city}` : ''}
                  </p>
                </Link>
                <button
                  onClick={(e) => handleDelete(e, trip.id)}
                  disabled={deletingId === trip.id}
                  title="Delete trip"
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {deletingId === trip.id ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {trips.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/generate" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plan another trip
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
