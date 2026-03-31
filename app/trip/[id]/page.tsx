'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AddItemCommand,
  RemoveItemCommand,
  EditItemCommand
} from '@/lib/commands/itinerary-commands'

type ItineraryItem = {
  id: string
  day_number: number
  item_order: number
  scheduled_date: string | null
  place_name: string
  category: string | null
  activity_type: string | null
  rating: number | null
  duration_minutes: number | null
  estimated_cost_cents: number | null
  selection_reason: string | null
}

type TripResponse = {
  trip: {
    id: string
    title: string
    destination_city: string
    destination_region: string | null
    start_date: string
    end_date: string
  }
  preferences: {
    preferred_categories?: string[] | null
  } | null
  itinerary_items: ItineraryItem[]
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

function formatDayDate(dateString: string) {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function TripPage() {
  const params = useParams()
  const id = params?.id as string
  const [trip, setTrip] = useState<TripResponse | null>(null)
  const [notFound, setNotFound] = useState(false)

  function executeCommand(command: { execute: () => void }) {
  try {
    command.execute()

    // Force React to re-render
    setTrip({ ...trip! })
  } catch (e: any) {
    alert(e.message)
  }
}
  useEffect(() => {
    if (!id) return
    async function loadTrip() {
      try {
        setNotFound(false)

        const res = await fetch(`http://localhost:5050/api/v1/trips/${id}`)

        if (res.status === 404){
          setNotFound(true)
          return
        }
        if (!res.ok) {
          throw new Error('Failed to load trip')
        }

        const data = await res.json()
        setTrip(data)
      } catch (err){
        console.error(err)
        setNotFound(true)
      }
    }
    
    loadTrip()
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

  const title = trip.trip.title +
  (trip.trip.start_date && trip.trip.end_date ? ` · ${formatDateRange(trip.trip.start_date, trip.trip.end_date)}` : '')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/my-trips" className="text-sm text-primary-600 hover:underline mb-2 inline-block">
              ← Back to My Trips
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{trip.trip.title}</h1>
            <p className="text-gray-500 mt-1">
              {formatDateRange(trip.trip.start_date, trip.trip.end_date)}
            </p>
            {trip.preferences?.preferred_categories?.length ? (
              <p className="mt-1 text-gray-600 text-sm">Interests: {trip.preferences.preferred_categories.join(', ')}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from(new Set(trip.itinerary_items.map((item) => item.day_number))).map((dayNumber) => {
            const dayItems = trip.itinerary_items
              .filter((item) => item.day_number === dayNumber)
              .sort((a, b) => a.item_order - b.item_order)

            const dayDate = dayItems[0]?.scheduled_date

            return (
              <section key={dayNumber} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary-600 px-6 py-3">
                  <h2 className="text-lg font-semibold text-white">
                    Day {dayNumber} {dayDate ? ` · ${formatDayDate(dayDate)}` : ''}
                  </h2>
                </div>

                <ul className="divide-y divide-gray-200">
                  {dayItems.map((item) => (
                    <li key={item.id} className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-medium text-gray-900">{item.place_name}</h3>

                        <p className="text-sm text-gray-600">
                          {item.category || 'activity'}
                          {item.activity_type ? ` · ${item.activity_type}` : ''}
                        </p>

                        <div className="text-sm text-gray-500 flex flex-wrap gap-3">
                          {item.rating !== null ? <span>Rating: {item.rating}</span> : null}
                          {item.duration_minutes !== null ? <span>{item.duration_minutes} min</span> : null}
                          {item.estimated_cost_cents !== null ? (
                            <span>${(item.estimated_cost_cents / 100).toFixed(2)}</span>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
