import Link from 'next/link'

export default function GeneratePage() {
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
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Find Trips
            </Link>
            <Link
              href="/generate"
              className="text-primary-600 font-semibold"
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
      <section className="container mx-auto px-6 py-10">
        <div className="max-w-3xl">
          <p className="text-primary-600 font-semibold">Itinerary Generator</p>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            Build a trip plan tailored to you
          </h1>
          <p className="text-gray-600 mt-3">
            Tell us where you want to go and how you like to travel. We will craft a
            day-by-day plan with activities, timing, and budget-friendly suggestions.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-10">
          <form className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  placeholder="e.g. Lisbon, Portugal"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Travelers
                </label>
                <input
                  type="number"
                  name="travelers"
                  min={1}
                  placeholder="2"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start date
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End date
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget
                </label>
                <select
                  name="budget"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="budget">Budget-friendly</option>
                  <option value="moderate">Moderate</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Travel style
                </label>
                <select
                  name="style"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="cultural">Cultural</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="family">Family-friendly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interests
              </label>
              <textarea
                name="interests"
                rows={4}
                placeholder="Food tours, museums, hiking, hidden gems..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="button"
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Generate itinerary
            </button>
          </form>

          <aside className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">What you get</h2>
              <ul className="mt-4 space-y-3 text-gray-600 text-sm">
                <li>✓ Day-by-day schedule with timing suggestions</li>
                <li>✓ Local food, activity, and sightseeing ideas</li>
                <li>✓ Budget guidance with estimates</li>
                <li>✓ Flexible options for morning, afternoon, and evening</li>
              </ul>
            </div>
            <div className="bg-primary-50 rounded-xl p-5 text-sm text-primary-700">
              We are currently in beta. Your feedback helps us tailor smarter itineraries.
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
