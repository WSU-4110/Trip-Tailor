'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTripFromQuestionnaire } from '@/lib/trip-store'

const INTERESTS = ['Food & Dining', 'Museums & Culture', 'Outdoors & Nature', 'Shopping', 'Nightlife', 'History', 'Adventure']
const BUDGET_OPTIONS = ['Budget', 'Moderate', 'Luxury']
const PACE_OPTIONS = ['Relaxed', 'Moderate', 'Active']

export default function GeneratePage() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [pace, setPace] = useState('')
  const [accessibility, setAccessibility] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleInterest(value: string) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!destination.trim()) next.destination = 'Destination is required'
    if (!startDate) next.startDate = 'Start date is required'
    if (!endDate) next.endDate = 'End date is required'
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      next.endDate = 'End date must be on or after start date'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const trip = createTripFromQuestionnaire({
      destination: destination.trim(),
      startDate,
      endDate,
      interests: interests.length ? interests : undefined,
      budget: budget || undefined,
      pace: pace || undefined,
      accessibility: accessibility.trim() || undefined,
    })
    router.push(`/trip/${trip.id}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Itinerary</h1>
        <p className="text-gray-600 mb-8">
          Tell us about your trip and preferences so we can tailor your itinerary.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Trip basics */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination *
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, Tokyo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
                {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End date *
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-6">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <label key={interest} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={interests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Budget</p>
                <div className="flex gap-4">
                  {BUDGET_OPTIONS.map((opt) => (
                    <label key={opt} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="budget"
                        value={opt}
                        checked={budget === opt}
                        onChange={() => setBudget(opt)}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Pace</p>
                <div className="flex gap-4">
                  {PACE_OPTIONS.map((opt) => (
                    <label key={opt} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="pace"
                        value={opt}
                        checked={pace === opt}
                        onChange={() => setPace(opt)}
                        className="border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="accessibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibility needs (optional)
                </label>
                <input
                  id="accessibility"
                  type="text"
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value)}
                  placeholder="e.g. wheelchair access, dietary restrictions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>
            </div>
          </section>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Generate itinerary
            </button>
            <Link
              href="/"
              className="px-8 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
