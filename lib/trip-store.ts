export interface ItineraryItem {
  id: string
  name: string
  time?: string
  description?: string
}

export interface TripDay {
  day: number
  date: string
  items: ItineraryItem[]
}

export interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  interests?: string[]
  budget?: string
  pace?: string
  accessibility?: string
  days: TripDay[]
  createdAt: string
}

const STORAGE_KEY = 'trip-tailor-trips'

function getStoredTrips(): Trip[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStoredTrips(trips: Trip[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
  } catch {
    // ignore
  }
}

export function saveTrip(trip: Trip): void {
  const trips = getStoredTrips()
  const index = trips.findIndex((t) => t.id === trip.id)
  if (index >= 0) {
    trips[index] = trip
  } else {
    trips.push(trip)
  }
  setStoredTrips(trips)
}

export function getTrip(id: string): Trip | null {
  const trips = getStoredTrips()
  return trips.find((t) => t.id === id) ?? null
}

export function getAllTrips(): Trip[] {
  return getStoredTrips()
}

export function generateId(): string {
  return `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generatePlaceholderItinerary(destination: string, startDate: string, endDate: string): TripDay[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days: TripDay[] = []
  let d = new Date(start)
  let dayNum = 1
  while (d <= end) {
    days.push({
      day: dayNum,
      date: d.toISOString().slice(0, 10),
      items: [
        { id: `a-${dayNum}-1`, name: 'Morning activity', time: '09:00', description: `Explore ${destination}` },
        { id: `a-${dayNum}-2`, name: 'Lunch', time: '12:30', description: 'Local cuisine' },
        { id: `a-${dayNum}-3`, name: 'Afternoon activity', time: '14:00', description: 'Sightseeing' },
        { id: `a-${dayNum}-4`, name: 'Dinner', time: '19:00', description: 'Evening meal' },
      ],
    })
    d.setDate(d.getDate() + 1)
    dayNum++
  }
  return days
}

export function createTripFromQuestionnaire(data: {
  destination: string
  startDate: string
  endDate: string
  interests?: string[]
  budget?: string
  pace?: string
  accessibility?: string
}): Trip {
  const id = generateId()
  const days = generatePlaceholderItinerary(data.destination, data.startDate, data.endDate)
  const trip: Trip = {
    id,
    destination: data.destination,
    startDate: data.startDate,
    endDate: data.endDate,
    interests: data.interests,
    budget: data.budget,
    pace: data.pace,
    accessibility: data.accessibility,
    days,
    createdAt: new Date().toISOString(),
  }
  saveTrip(trip)
  return trip
}
