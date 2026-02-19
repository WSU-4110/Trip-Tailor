'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTrip } from '@/lib/trip-store'
import { getPresetTrip } from '@/lib/presets'
import type { Trip } from '@/lib/trip-store'

export default function TripPage() {
  const params = useParams()
  const id = params?.id as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    const stored = getTrip(id)
    if (stored) {
      setTrip(stored)
      return
    }
    const preset = getPresetTrip(id)
    if (preset) {
      setTrip(preset)
      return
    }
    setNotFound(true)
  }, [id])

  if (notFound) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <p className="text-gray-600 mb-6">This itinerary may have been removed or the link is invalid.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/my-trips" className="text-primary-600 font-semibold hover:underline">
              My Trips
            </Link>
            <Link href="/trips" className="text-primary-600 font-semibold hover:underline">
              Explore Trips
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
        <div className="container mx-auto px-6 max-w-2xl text-center text-gray-600">
          Loading itinerary…
        </div>
      </main>
    )
  }

  const title = trip.destination + (trip.startDate && trip.endDate ? ` · ${trip.startDate} – ${trip.endDate}` : '')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/my-trips" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
              ← Back to My Trips
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {trip.interests?.length ? (
              <p className="mt-1 text-gray-600 text-sm">Interests: {trip.interests.join(', ')}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trip.days.map((day) => (
            <section key={day.day} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-primary-600 px-6 py-3">
                <h2 className="text-lg font-semibold text-white">
                  Day {day.day} {day.date && !day.date.startsWith('Day') ? `· ${day.date}` : ''}
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {day.items.map((item) => (
                  <li key={item.id} className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      {item.time ? (
                        <span className="text-sm font-medium text-primary-600 shrink-0 w-14">{item.time}</span>
                      ) : null}
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.description ? (
                          <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
