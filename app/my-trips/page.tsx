'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllTrips } from '@/lib/trip-store'
import type { Trip } from '@/lib/trip-store'

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    setTrips(getAllTrips())
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
        <p className="text-gray-600 mb-8">
          Your saved itineraries. Click a trip to view or continue editing.
        </p>

        {trips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h2>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
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
              const title = `${trip.destination}${trip.startDate && trip.endDate ? ` · ${trip.startDate} – ${trip.endDate}` : ''}`
              return (
                <li key={trip.id}>
                  <Link
                    href={`/trip/${trip.id}`}
                    className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
                    <p className="text-sm text-gray-600">
                      {trip.days.length} day{trip.days.length !== 1 ? 's' : ''}
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
