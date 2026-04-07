'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


export default function GeneratePage() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/Login");
    }
  }, []);

function validate(): boolean {
  const next: Record<string, string> = {}

  if (!destination.trim()) next.destination = 'Destination is required'
  if (!startDate) next.startDate = 'Start date is required'
  if (!endDate) next.endDate = 'End date is required'

  const today = new Date()
  const currentYear = today.getFullYear()

  function isValidDate(dateStr: string): boolean {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return false

    const year = Number(parts[0])
    const month = Number(parts[1])
    const day = Number(parts[2])

    // Basic numeric checks
    if (year < currentYear) return false
    if (month < 1 || month > 12) return false
    if (day < 1) return false

    // Days in month (handles leap years automatically)
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day > daysInMonth) return false

    return true
  }

  if (startDate && !isValidDate(startDate)) {
    next.startDate = 'Start date is invalid'
  }

  if (endDate && !isValidDate(endDate)) {
    next.endDate = 'End date is invalid'
  }

  if (
    startDate &&
    endDate &&
    isValidDate(startDate) &&
    isValidDate(endDate) &&
    new Date(endDate) < new Date(startDate)
  ) {
    next.endDate = 'End date must be on or after start date'
  }

  setErrors(next)
  return Object.keys(next).length === 0
}

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const params = new URLSearchParams({
      destination: destination.trim(),
      startDate,
      endDate,
    })

    router.push(`/questionnaire?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Your Itinerary</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Enter your trip details to get started, then continue to the questionnaire.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Trip basics */}
          <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 dark:border dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trip details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination *
                </label>
                <input
                  id="destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, Tokyo"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700"
                />
                {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700"
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End date *
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-700"
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>
            </div>
          </section>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary-600 dark:bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              Start Questionnaire
            </button>
            <Link
              href="/"
              className="px-8 py-3 rounded-lg font-semibold border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
