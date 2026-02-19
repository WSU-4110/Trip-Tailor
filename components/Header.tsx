import Link from 'next/link'

export default function Header() {
  return (
    <nav className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
          TripTailor
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/trips"
            className="text-gray-700 hover:text-primary-600 transition-colors"
          >
            Explore Trips
          </Link>
          <Link
            href="/generate"
            className="text-gray-700 hover:text-primary-600 transition-colors"
          >
            Generate Itinerary
          </Link>
          <Link
            href="/my-trips"
            className="text-gray-700 hover:text-primary-600 transition-colors"
          >
            My Trips
          </Link>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  )
}
