import type { Trip } from './trip-store'

export interface TripPreset {
  id: string
  slug: string
  title: string
  description: string
  destination: string
  duration: string
}

export const TRIP_PRESETS: TripPreset[] = [
  {
    id: 'preset-paris',
    slug: 'paris',
    title: 'Weekend in Paris',
    description: 'Two days of art, cafes, and iconic landmarks in the City of Light.',
    destination: 'Paris, France',
    duration: '2 days',
  },
  {
    id: 'preset-beach',
    slug: 'beach',
    title: 'Beach Getaway',
    description: 'Sun, sand, and relaxation. A classic coastal escape.',
    destination: 'Tropical Beach',
    duration: '5 days',
  },
  {
    id: 'preset-city',
    slug: 'city',
    title: 'City Explorer',
    description: 'Museums, street food, and urban adventures in a major city.',
    destination: 'New York City',
    duration: '4 days',
  },
  {
    id: 'preset-mountain',
    slug: 'mountain',
    title: 'Mountain Adventure',
    description: 'Hiking, fresh air, and stunning mountain views.',
    destination: 'Rocky Mountains',
    duration: '3 days',
  },
]

function presetItinerary(id: string, destination: string, dayCount: number): Trip['days'] {
  const days: Trip['days'] = []
  for (let i = 1; i <= dayCount; i++) {
    days.push({
      day: i,
      date: `Day ${i}`,
      items: [
        { id: `p-${id}-${i}-1`, name: 'Morning activity', time: '09:00', description: `Explore ${destination}` },
        { id: `p-${id}-${i}-2`, name: 'Lunch', time: '12:30', description: 'Local spot' },
        { id: `p-${id}-${i}-3`, name: 'Afternoon', time: '14:00', description: 'Sightseeing' },
        { id: `p-${id}-${i}-4`, name: 'Dinner', time: '19:00', description: 'Evening meal' },
      ],
    })
  }
  return days
}

export function getPresetTrip(id: string): Trip | null {
  const preset = TRIP_PRESETS.find((p) => p.id === id)
  if (!preset) return null
  const dayCount = preset.duration.startsWith('2') ? 2 : preset.duration.startsWith('3') ? 3 : preset.duration.startsWith('4') ? 4 : 5
  return {
    id: preset.id,
    destination: preset.destination,
    startDate: '',
    endDate: '',
    days: presetItinerary(preset.slug, preset.destination, dayCount),
    createdAt: new Date().toISOString(),
  }
}
