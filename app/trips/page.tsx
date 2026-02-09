import Link from 'next/link'
import Image from 'next/image'
import { sampleTrips } from '../data/sampleTrips'

export default function TripsPage() {
  const trips = Array.isArray(sampleTrips) ? sampleTrips : []

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            TripTailor
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/trips"
              className="text-primary-600 font-semibold"
            >
              Find Trips
            </Link>
            <Link
              href="/generate"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Generate Itinerary
            </Link>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Trips
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Browse curated adventures from around the world. Find inspiration for your next journey.
        </p>
      </section>

      {/* Trip Cards Grid */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={trip.imageUrl}
                  alt={trip.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                    {trip.travelStyle}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <span className="text-white text-sm font-medium drop-shadow-lg">
                    {trip.country}
                  </span>
                  <span className="text-white text-sm font-medium bg-black/40 px-2 py-1 rounded">
                    {trip.duration}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {trip.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {trip.description}
                </p>
                <ul className="flex flex-wrap gap-2 mb-4">
                  {trip.highlights.slice(0, 3).map((highlight) => (
                    <li
                      key={highlight}
                      className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-semibold">
                    {trip.priceRange}
                  </span>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
