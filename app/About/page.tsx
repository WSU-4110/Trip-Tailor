"use client";

import Link from "next/link";

const TECH_STACK = [
  { name: "Next.js 14", description: "React framework for the frontend", color: "bg-gray-100 text-gray-800" },
  { name: "TypeScript", description: "Type-safe JavaScript", color: "bg-blue-100 text-blue-800" },
  { name: "Tailwind CSS", description: "Utility-first styling", color: "bg-cyan-100 text-cyan-800" },
  { name: "Flask", description: "Python backend API", color: "bg-green-100 text-green-800" },
  { name: "PostgreSQL", description: "Relational database", color: "bg-indigo-100 text-indigo-800" },
  { name: "Google Places API", description: "Location & activity data", color: "bg-yellow-100 text-yellow-800" },
  { name: "Yelp Fusion API", description: "Restaurant & venue data", color: "bg-red-100 text-red-800" },
  { name: "JWT Auth", description: "Secure user authentication", color: "bg-purple-100 text-purple-800" },
];

const TEAM = [
  { name: "Abdul", role: "Frontend Developer" },
  { name: "Nathaniel", role: "Backend Developer" },
  { name: "Raka", role: "Full Stack Developer" },
  { name: "Anderson", role: "Database & API Integration" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          About <span className="text-primary-600">TripTailor</span>
        </h1>
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          TripTailor is an AI-powered travel planning platform built to make trip planning simple,
          personal, and enjoyable. Tell us your destination, travel style, and budget — we handle
          the rest, generating a day-by-day itinerary tailored specifically to you.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Whether you&apos;re planning a spontaneous weekend getaway or a month-long adventure abroad,
          TripTailor takes your preferences into account at every step — from activity pacing to
          budget-friendly options and accessibility needs.
        </p>
      </section>

      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe great travel shouldn&apos;t require hours of research, spreadsheets, and guesswork.
                Our mission is to remove the friction from trip planning so you can spend more time
                actually enjoying the journey. By combining real-world data from Google Places and Yelp
                with smart preference matching, we build itineraries that actually fit your life.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Built With</h2>
        <p className="text-gray-600 mb-8">
          TripTailor is a full-stack web application built by WSU students using modern tools and technologies.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {TECH_STACK.map((tech) => (
            <div key={tech.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full mb-2 ${tech.color}`}>
                {tech.name}
              </span>
              <p className="text-sm text-gray-500">{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the Team</h2>
          <p className="text-gray-600 mb-8">
            We&apos;re a student-led software development team from Wayne State University, building
            TripTailor as part of CSC 4110.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center border border-blue-100">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to plan your next trip?</h2>
        <p className="text-gray-600 mb-8">Try TripTailor free — no credit card required.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/generate" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
            Generate an Itinerary
          </Link>
          <Link href="/contact" className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
            Get in Touch
          </Link>
        </div>
      </section>
    </main>
  );
}
