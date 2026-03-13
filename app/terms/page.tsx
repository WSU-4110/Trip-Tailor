"use client";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        
        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          Terms & Conditions
        </h1>

        <p className="text-gray-600 mb-6">
          By using TripTailor, you agree to the following terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          Educational Project
        </h2>
        <p className="text-gray-600 mb-6">
          TripTailor is a student-made and student-run project created for
          educational purposes. It is not a commercial travel service.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          No Professional Advice
        </h2>
        <p className="text-gray-600 mb-6">
          The itineraries generated are suggestions only. We do not guarantee
          accuracy, availability, pricing, or safety of any recommendations.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          Use at Your Own Risk
        </h2>
        <p className="text-gray-600 mb-6">
          Users are responsible for verifying travel details, bookings, and
          local conditions before making plans.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          External Data
        </h2>
        <p className="text-gray-600 mb-6">
          Our generator uses publicly available internet data. We are not
          responsible for errors or outdated information from external sources.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          Changes to Terms
        </h2>
        <p className="text-gray-600">
          These terms may be updated as the project evolves.
        </p>

      </section>
    </main>
  )
}