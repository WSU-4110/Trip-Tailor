import Link from 'next/link'
import Image from 'next/image'
import { TRIP_PRESETS } from '@/lib/presets'

export default function TripsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-6 max-w-6xl py-12">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/70 px-4 py-2 text-sm text-gray-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
            Trip presets
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Explore Trips
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
            Get inspired with curated examples. Pick a vibe, preview a sample itinerary, then generate
            your own.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {TRIP_PRESETS.map((preset) => (
            <Link
              key={preset.id}
              href={`/trip/${preset.id}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                <Image
                  src={preset.imageUrl}
                  alt={preset.destination}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  priority={preset.id === 'preset-paris'}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur">
                    {preset.duration}
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm backdrop-blur">
                    {preset.destination}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-semibold text-white drop-shadow sm:text-2xl">
                    {preset.title}
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-600">{preset.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
                    View sample itinerary
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-xs text-gray-500">Preset</span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-14 rounded-2xl border border-primary-100 bg-white/70 p-6 text-center shadow-sm backdrop-blur sm:p-8">
          <p className="text-gray-700">
            Want a personalized itinerary instead of a preset?
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Generate Itinerary
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
