// ─────────────────────────────────────────────
// Command Pattern — Itinerary Commands
// ─────────────────────────────────────────────
// Each operation on a trip itinerary (add, delete, edit, swap)
// is encapsulated as a Command object.
// The CommandInvoker executes commands and keeps a history
// so callers never need to know the API details.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5050'

// ── Command interface ──────────────────────────────────────────
export interface Command {
  execute(): Promise<void>
}

// ── ItineraryItem type (mirrors backend response) ─────────────
export type ItineraryItem = {
  id: string
  day_number: number
  item_order: number
  scheduled_date: string | null
  notes: string | null
  custom_name: string | null
  custom_address: string | null
  source_type: string
  place_name: string
  city: string | null
  region: string | null
  address_line1: string | null
  latitude: number | null
  longitude: number | null
  website_url: string | null
  google_maps_url: string | null
  phone: string | null
  activity_title: string | null
  category: string | null
  activity_type: string | null
  description: string | null
  tags: string[] | null
  rating: number | null
  review_count: number | null
  estimated_cost_cents: number | null
  duration_minutes: number | null
  effort_level: number | null
  indoor_outdoor: string | null
  family_friendly: boolean | null
  good_for_kids: boolean | null
  good_for_groups: boolean | null
  pet_friendly: boolean | null
  wheelchair_accessible: boolean | null
  reservations_required: boolean | null
  ticket_required: boolean | null
  noise_level: string | null
  price_level: number | null
  source_url: string | null
}

// ── DeleteItemCommand ─────────────────────────────────────────
// Encapsulates a DELETE request to remove one itinerary item.
export class DeleteItemCommand implements Command {
  constructor(
    private tripId: string,
    private itemId: string,
    private onSuccess: (itemId: string) => void
  ) {}

  async execute(): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/v1/trips/${this.tripId}/items/${this.itemId}`,
      { method: 'DELETE' }
    )
    if (!res.ok) throw new Error('Failed to delete activity')
    this.onSuccess(this.itemId)
  }
}

// ── EditItemCommand ───────────────────────────────────────────
// Encapsulates a PATCH request to update notes/name/address
// on an existing itinerary item.
export class EditItemCommand implements Command {
  constructor(
    private tripId: string,
    private itemId: string,
    private patch: { custom_name?: string; custom_address?: string; notes?: string },
    private onSuccess: (itemId: string, patch: EditItemCommand['patch']) => void
  ) {}

  async execute(): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/v1/trips/${this.tripId}/items/${this.itemId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.patch),
      }
    )
    if (!res.ok) throw new Error('Failed to save changes')
    this.onSuccess(this.itemId, this.patch)
  }
}

// ── AddCustomItemCommand ──────────────────────────────────────
// Encapsulates a POST request to add a user-defined activity
// to a specific day of the itinerary.
export class AddCustomItemCommand implements Command {
  constructor(
    private tripId: string,
    private dayNumber: number,
    private payload: { custom_name: string; custom_address?: string | null; notes?: string | null },
    private onSuccess: () => Promise<void>
  ) {}

  async execute(): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/v1/trips/${this.tripId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_name: this.payload.custom_name,
          custom_address: this.payload.custom_address ?? null,
          notes: this.payload.notes ?? null,
          day_number: this.dayNumber,
          source_type: 'user',
        }),
      }
    )
    if (!res.ok) throw new Error('Failed to add activity')
    await this.onSuccess()
  }
}

// ── AddRecommendedItemCommand ─────────────────────────────────
// Encapsulates a POST request to add a backend-recommended
// activity (from the alternates endpoint) to a specific day.
export class AddRecommendedItemCommand implements Command {
  constructor(
    private tripId: string,
    private dayNumber: number,
    private alternate: { place_id: string; activity_id: string },
    private onSuccess: () => Promise<void>
  ) {}

  async execute(): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/v1/trips/${this.tripId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: this.alternate.place_id,
          activity_id: this.alternate.activity_id,
          day_number: this.dayNumber,
          source_type: 'user',
        }),
      }
    )
    if (!res.ok) throw new Error('Failed to add recommended activity')
    await this.onSuccess()
  }
}

// ── SwapItemCommand ───────────────────────────────────────────
// Encapsulates deleting an existing item and inserting an
// alternate in its place — two API calls treated as one command.
export class SwapItemCommand implements Command {
  constructor(
    private tripId: string,
    private oldItem: ItineraryItem,
    private alternate: { place_id: string; activity_id: string },
    private onSuccess: () => Promise<void>
  ) {}

  async execute(): Promise<void> {
    const deleteRes = await fetch(
      `${API_BASE}/api/v1/trips/${this.tripId}/items/${this.oldItem.id}`,
      { method: 'DELETE' }
    )
    if (!deleteRes.ok) throw new Error('Failed to remove old activity')

    const addRes = await fetch(
      `${API_BASE}/api/v1/trips/${this.tripId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: this.alternate.place_id,
          activity_id: this.alternate.activity_id,
          day_number: this.oldItem.day_number,
          item_order: this.oldItem.item_order,
          scheduled_date: this.oldItem.scheduled_date,
          source_type: 'user',
        }),
      }
    )
    if (!addRes.ok) throw new Error('Failed to add replacement activity')
    await this.onSuccess()
  }
}

// ── CommandInvoker ────────────────────────────────────────────
// The Invoker is responsible for executing commands and
// maintaining a history log of what has been run.
// The TripPage uses this instead of calling fetch() directly.
export class CommandInvoker {
  private history: Command[] = []

  async execute(command: Command): Promise<void> {
    await command.execute()
    this.history.push(command)
  }

  getHistory(): Command[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }
}
