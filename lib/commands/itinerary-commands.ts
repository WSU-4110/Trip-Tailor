// Command interface
export interface Command {
  execute(): void
}

import type { ItineraryItem, Trip } from '@/lib/trip-store'

// Add Item
export class AddItemCommand implements Command {
  constructor(
    private trip: Trip,
    private dayNumber: number,
    private item: ItineraryItem
  ) {}

  execute() {
    const day = this.trip.days.find(d => d.day === this.dayNumber)
    if (!day) throw new Error('Day not found')

    // validation example
    const exists = day.items.some(i => i.id === this.item.id)
    if (exists) throw new Error('Item already exists')

    day.items.push(this.item)
  }
}


// Remove Item
export class RemoveItemCommand implements Command {
  constructor(
    private trip: Trip,
    private dayNumber: number,
    private itemId: string
  ) {}

  execute() {
    const day = this.trip.days.find(d => d.day === this.dayNumber)
    if (!day) throw new Error('Day not found')

    const index = day.items.findIndex(i => i.id === this.itemId)
    if (index === -1) throw new Error('Item not found')

    day.items.splice(index, 1)
  }
}

// Edit Item
export class EditItemCommand implements Command {
  constructor(
    private trip: Trip,
    private dayNumber: number,
    private itemId: string,
    private updates: Partial<ItineraryItem>
  ) {}

  execute() {
    const day = this.trip.days.find(d => d.day === this.dayNumber)
    if (!day) throw new Error('Day not found')

    const item = day.items.find(i => i.id === this.itemId)
    if (!item) throw new Error('Item not found')

    Object.assign(item, this.updates)
  }
}