import Link from 'next/link'
import { TRIP_PRESETS } from '@/lib/presets'

export default function TripsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Trips</h1>
        <p className="text-gray-600 mb-10">
          Get inspired with these trip presets. Click one to view a sample itinerary.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {TRIP_PRESETS.map((preset) => (
            <Link
              key={preset.id}
              href={`/trip/${preset.id}`}
              className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="h-40 bg-gradient-to-br from-primary-100 to-cyan-100 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-primary-300 group-hover:text-primary-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {preset.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3">{preset.description}</p>
                <p className="text-xs text-gray-500">
                  {preset.destination} · {preset.duration}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Want a personalized itinerary instead?</p>
          <Link
            href="/generate"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Generate Itinerary
          </Link>
        </div>
      </div>
    </main>
  )
}
