import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Perfect Trip,
            <span className="text-primary-600 dark:text-primary-400"> Tailored Just for You</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
            Discover amazing destinations and generate personalized itineraries 
            that match your travel style. Whether you're planning a weekend getaway 
            or a month-long adventure, TripTailor has you covered.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/generate"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Create Your Itinerary
            </Link>

            <Link
              href="/questionnaire"
              className="bg-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-cyan-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Questionnaire
            </Link>

            <Link
              href="/trips"
              className="bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 dark:border-primary-500 hover:bg-primary-50 dark:hover:bg-slate-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Explore Trips
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why Choose TripTailor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow dark:border dark:border-slate-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Smart Itinerary Generator
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized day-by-day itineraries based on your preferences, 
                budget, and travel dates. Our AI-powered system creates the perfect 
                plan for you.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow dark:border dark:border-slate-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Discover Amazing Trips
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse curated trips from around the world. Find inspiration 
                for your next adventure and connect with fellow travelers.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow dark:border dark:border-slate-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2v7m-6 4a2 2 0 100-4 2 2 0 000 4zm0 0v3m0-3a2 2 0 110-4m6 4v3m0-3a2 2 0 110-4m0 4v-1m0 1a2 2 0 001-4v-1m-4 1a2 2 0 001 4m0 0v1m0-1a2 2 0 00-1-4v-1m4 1v-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Budget-Friendly Planning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Plan trips that fit your budget. Get cost estimates and find 
                the best deals on accommodations, activities, and dining.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-600 to-cyan-600 dark:from-primary-700 dark:to-cyan-800 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who trust TripTailor for their trip planning needs.
          </p>
          <Link
            href="/generate"
            className="inline-block bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                TripTailor
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Your personal travel itinerary generator and trip discovery platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/generate" className="hover:text-primary-600 dark:hover:text-primary-400">Generate Itinerary</Link></li>
                <li><Link href="/trips" className="hover:text-primary-600 dark:hover:text-primary-400">Explore Trips</Link></li>
                <li><Link href="/my-trips" className="hover:text-primary-600 dark:hover:text-primary-400">My Trips</Link></li>
                <li><Link href="/features" className="hover:text-primary-600 dark:hover:text-primary-400">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/about" className="hover:text-primary-600 dark:hover:text-primary-400">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary-600 dark:hover:text-primary-400">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary-600 dark:hover:text-primary-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} TripTailor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

