'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'



type ItineraryItem = {
  id: string
  day_number: number
  item_order: number
  scheduled_date: string | null
  notes: string | null
  custom_name: string | null
  custom_address: string | null
  source_type: string
  // place fields
  place_name: string
  city: string | null
  region: string | null
  address_line1: string | null
  latitude: number | null
  longitude: number | null
  website_url: string | null
  google_maps_url: string | null
  phone: string | null
  // activity fields
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

type TripResponse = {
  trip: {
    id: string
    title: string
    destination_city: string
    destination_region: string | null
    start_date: string
    end_date: string
    trip_days: number
  }
  preferences: {
    preferred_categories?: string[] | null
    budget_level?: string | null
    group_size?: number | null
  } | null
  itinerary_items: ItineraryItem[]
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }

  const startFormatted = startDate.toLocaleDateString('en-US', options)
  const endFormatted = endDate.toLocaleDateString('en-US', options)

  return `${startFormatted} – ${endFormatted}`
}

function formatDayDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatCost(cents: number | null): string {
  if (cents === null) return ''
  if (cents === 0) return 'Free'
  return `~$${(cents / 100).toFixed(0)}`
}

function formatDuration(mins: number | null): string {
  if (!mins) return ''
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function effortLabel(level: number | null): string {
  if (level === null) return ''
  return ['', 'Easy', 'Moderate', 'Active', 'Strenuous', 'Extreme'][level] ?? ''
}

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] ?? colors.gray}`}>
      {label}
    </span>
  )
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        {children}
      </button>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded text-xs bg-gray-800 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {label}
      </span>
    </div>
  )
}

function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-xs text-red-700 flex-1">Remove this activity?</p>
      <button
        onClick={onConfirm}
        className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-md transition-colors"
      >
        Remove
      </button>
      <button
        onClick={onCancel}
        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
      >
        Cancel
      </button>
    </div>
  )
}

function InlineEditForm({
  item,
  onSave,
  onCancel,
}: {
  item: ItineraryItem
  onSave: (name: string, address: string, notes: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item.custom_name ?? item.place_name ?? '')
  const [address, setAddress] = useState(item.custom_address ?? item.address_line1 ?? '')
  const [notes, setNotes] = useState(item.notes ?? '')
  const isCustom = item.source_type === 'user'

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
      {isCustom && (
        <>
          <div>
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-0.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Address <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-0.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </>
      )}
      <div>
        <label className="text-xs font-medium text-gray-600">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full mt-0.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(name, address, notes)}
          className="text-xs font-medium bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function NotesEditor({
  tripId,
  item,
  onSaved,
}: {
  tripId: string
  item: ItineraryItem
  onSaved: (itemId: string, newNotes: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch(`http://localhost:5050/api/v1/trips/${tripId}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: draft }),
      })
      onSaved(item.id, draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="mt-2">
        {item.notes ? (
          <div className="flex items-start gap-2">
            <p className="text-sm text-gray-600 italic flex-1">{item.notes}</p>
            <button
              onClick={() => { setDraft(item.notes ?? ''); setEditing(true) }}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex-shrink-0"
            >
              Edit
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1"
          >
            + Add a note
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-1.5">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a note about this activity..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        rows={2}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="text-xs font-medium bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function AddActivityPanel({
  dayNumber,
  addMode,
  addAlternates,
  loadingAddAlternates,
  onChooseCustom,
  onChooseRecommendations,
  onAddCustom,
  onAddRecommended,
  onCancel,
}: {
  dayNumber: number
  addMode: 'choice' | 'custom' | 'recommendations' | null
  addAlternates: any[]
  loadingAddAlternates: boolean
  onChooseCustom: () => void
  onChooseRecommendations: () => void
  onAddCustom: (dayNumber: number, name: string, address: string, notes: string) => void
  onAddRecommended: (alternate: any, dayNumber: number) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  if (addMode === 'choice') {
    return (
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-600 mb-2">What would you like to add?</p>
        <div className="flex gap-2">
          <button
            onClick={onChooseCustom}
            className="flex-1 text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            Custom activity
          </button>
          <button
            onClick={onChooseRecommendations}
            className="flex-1 text-xs font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
          >
            Recommendations
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (addMode === 'custom') {
    return (
      <div className="px-5 py-4 border-t border-gray-100 space-y-2">
        <p className="text-xs font-medium text-gray-600">Add a custom activity</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address (optional)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { if (name.trim()) onAddCustom(dayNumber, name, address, notes) }}
            className="text-xs font-medium bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (addMode === 'recommendations') {
    return (
      <div className="border-t border-gray-100">
        <div className="px-5 py-3 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-600">Recommended activities</p>
          <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
        {loadingAddAlternates ? (
          <div className="px-5 py-4 text-xs text-gray-400">Loading recommendations...</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {addAlternates.map((alt) => (
              <li key={alt.activity_id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alt.place_name}</p>
                  <p className="text-xs text-gray-500">
                    {alt.category?.replace(/_/g, ' ')}
                    {alt.rating ? ` · ★ ${alt.rating}` : ''}
                    {alt.estimated_cost_cents !== null ? ` · ${formatCost(alt.estimated_cost_cents)}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => onAddRecommended(alt, dayNumber)}
                  className="flex-shrink-0 text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return null
}

function SortableActivityCard(props: React.ComponentProps<typeof ActivityCard> & { editMode: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.item.id, disabled: !props.editMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : undefined,
    position: isDragging ? 'relative' as const : undefined,
  }

  return (
    <li ref={setNodeRef} style={style} className="relative">
      {props.editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 z-10"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </div>
      )}
      <ActivityCard {...props} />
    </li>
  )
}

function ActivityCard({
  item,
  index,
  tripId,
  onNotesSaved,
  editMode,
  confirmDeleteId,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  alternatesItemId,
  alternatesList,
  loadingAlternates,
  onFetchAlternates,
  onSwap,
  editItemId,
  onRequestEdit,
  onEditSave,
  onEditCancel,
}: {
  item: ItineraryItem
  index: number
  tripId: string
  onNotesSaved: (itemId: string, notes: string) => void
  editMode: boolean
  confirmDeleteId: string | null
  onRequestDelete: (itemId: string) => void
  onCancelDelete: () => void
  onConfirmDelete: (itemId: string) => void
  alternatesItemId: string | null
  alternatesList: any[]
  loadingAlternates: boolean
  onFetchAlternates: (itemId: string) => void
  onSwap: (oldItem: ItineraryItem, alternate: any) => void
  editItemId: string | null
  onEditSave: (item: ItineraryItem, name: string, address: string, notes: string) => void
  onEditCancel: () => void
  onRequestEdit: (itemId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const hasDetails =
    item.description ||
    (item.tags && item.tags.length > 0) ||
    item.address_line1 ||
    item.phone ||
    item.website_url ||
    item.google_maps_url ||
    item.ticket_required !== null ||
    item.reservations_required !== null ||
    item.family_friendly !== null ||
    item.wheelchair_accessible !== null

  return (
    <div className="px-5 py-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 leading-snug">{item.place_name}</h3>
                {item.activity_title && item.activity_title !== item.place_name && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.activity_title}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.estimated_cost_cents !== null && (
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 mr-1">
                  {formatCost(item.estimated_cost_cents)}
                </span>
              )}
              {editMode && (
                <>
                  {/* Pencil - edit */}
                  <IconButton label="Edit" onClick={() => onRequestEdit(item.id)}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </IconButton>
                  {/* Double arrow - swap */}
                  <IconButton label="Swap" onClick={() => onFetchAlternates(item.id)}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </IconButton>
                  {/* Trash - delete */}
                  <IconButton label="Delete" onClick={() => onRequestDelete(item.id)}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </IconButton>
                </>
              )}
            </div>
          </div>
          {confirmDeleteId === item.id && (
            <DeleteConfirm
              onConfirm={() => onConfirmDelete(item.id)}
              onCancel={onCancelDelete}
            />
          )}

          {alternatesItemId === item.id && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600">Swap with a suggestion</p>
              </div>
              {loadingAlternates ? (
                <div className="px-3 py-4 text-xs text-gray-400">Loading suggestions...</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {alternatesList.map((alt) => (
                    <li key={alt.activity_id} className="flex items-center justify-between gap-3 px-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{alt.place_name}</p>
                        <p className="text-xs text-gray-500">
                          {alt.category?.replace(/_/g, ' ')}
                          {alt.rating ? ` · ★ ${alt.rating}` : ''}
                          {alt.estimated_cost_cents !== null ? ` · ${formatCost(alt.estimated_cost_cents)}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => onSwap(item, alt)}
                        className="flex-shrink-0 text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Use this
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {editItemId === item.id && (
            <InlineEditForm
              item={item}
              onSave={(name, address, notes) => onEditSave(item, name, address, notes)}
              onCancel={onEditCancel}
            />
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
            {item.rating !== null && (
              <span className="flex items-center gap-1">
                <span className="text-amber-400">★</span>
                <span className="font-medium text-gray-700">{item.rating.toFixed(1)}</span>
                {item.review_count ? <span className="text-gray-400">({item.review_count.toLocaleString()})</span> : null}
              </span>
            )}
            {item.duration_minutes ? <span>⏱ {formatDuration(item.duration_minutes)}</span> : null}
            {item.effort_level !== null ? <span>{effortLabel(item.effort_level)}</span> : null}
            {item.indoor_outdoor && item.indoor_outdoor !== 'unknown' && (
              <span className="capitalize">
                {item.indoor_outdoor === 'both' ? 'Indoor & Outdoor' : item.indoor_outdoor}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.category && <Badge label={item.category.replace(/_/g, ' ')} color="blue" />}
            {item.ticket_required === true && <Badge label="Ticket required" color="amber" />}
            {item.reservations_required === true && <Badge label="Reservations suggested" color="amber" />}
            {item.family_friendly === true && <Badge label="Family friendly" color="green" />}
            {item.good_for_kids === true && <Badge label="Good for kids" color="green" />}
            {item.good_for_groups === true && <Badge label="Good for groups" color="green" />}
            {item.pet_friendly === true && <Badge label="Pet friendly" color="green" />}
            {item.wheelchair_accessible === true && <Badge label="Accessible" color="purple" />}
            {item.noise_level === 'loud' && <Badge label="Lively" color="rose" />}
            {item.noise_level === 'quiet' && <Badge label="Quiet" color="gray" />}
            {item.source_type === 'user' && <Badge label="Added by you" color="purple" />}
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <NotesEditor tripId={tripId} item={item} onSaved={onNotesSaved} />

          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              {expanded ? 'Hide details' : 'View details'}
              <svg
                className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              {item.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              )}
              {item.address_line1 && (
                <p className="text-sm text-gray-500">
                  {item.address_line1}{item.city ? `, ${item.city}` : ''}{item.region ? `, ${item.region}` : ''}
                </p>
              )}
              {item.phone && (
                <p className="text-sm text-gray-500">
                  <a href={`tel:${item.phone}`} className="hover:text-indigo-600">{item.phone}</a>
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {item.google_maps_url && (
                  <a href={item.google_maps_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg">
                    Open in Maps
                  </a>
                )}
                {item.website_url && (
                  <a href={item.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
                    Website
                  </a>
                )}
                {item.source_url && !item.website_url && (
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
                    View listing
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TripPage() {
  const params = useParams()
  const id = params?.id as string
  const [trip, setTrip] = useState<TripResponse | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [alternatesItemId, setAlternatesItemId] = useState<string | null>(null)
  const [alternates, setAlternates] = useState<any[]>([])
  const [loadingAlternates, setLoadingAlternates] = useState(false)
  const [addingToDayNumber, setAddingToDayNumber] = useState<number | null>(null)
  const [addMode, setAddMode] = useState<'choice' | 'custom' | 'recommendations' | null>(null)
  const [addAlternates, setAddAlternates] = useState<any[]>([])
  const [loadingAddAlternates, setLoadingAddAlternates] = useState(false)
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  function handleNotesSaved(itemId: string, notes: string) {
    setTrip((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        itinerary_items: prev.itinerary_items.map((item) =>
          item.id === itemId ? { ...item, notes } : item
        ),
      }
    })
  }

  async function handleDelete(itemId: string) {
    setSavingStatus('saving')
    try {
      const res = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items/${itemId}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Failed to delete')
      setTrip((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          itinerary_items: prev.itinerary_items.filter((i) => i.id !== itemId),
        }
      })
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 2000)
    } catch {
      setSavingStatus('idle')
      alert('Failed to delete activity. Please try again.')
    } finally {
      setConfirmDeleteId(null)
    }
  }

  async function fetchAlternates(itemId: string) {
    if (alternatesItemId === itemId) {
      setAlternatesItemId(null)
      return
    }
    setAlternatesItemId(itemId)
    setAlternates([])
    setLoadingAlternates(true)
    try {
      const res = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items/${itemId}/alternates`
      )
      if (!res.ok) throw new Error('Failed to fetch alternates')
      const data = await res.json()
      setAlternates(data)
    } catch {
      alert('Failed to load suggestions. Please try again.')
      setAlternatesItemId(null)
    } finally {
      setLoadingAlternates(false)
    }
  }

  async function handleSwap(oldItem: ItineraryItem, alternate: any) {
    setSavingStatus('saving')
    try {
      // Delete the old item
      const deleteRes = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items/${oldItem.id}`,
        { method: 'DELETE' }
      )
      if (!deleteRes.ok) throw new Error('Failed to delete old item')

      // Insert the new item in the same position
      const addRes = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place_id: alternate.place_id,
            activity_id: alternate.activity_id,
            day_number: oldItem.day_number,
            item_order: oldItem.item_order,
            scheduled_date: oldItem.scheduled_date,
            source_type: 'user',
          }),
        }
      )
      if (!addRes.ok) throw new Error('Failed to add new item')

      // Refetch the full trip so local state is accurate
      const tripRes = await fetch(`http://localhost:5050/api/v1/trips/${id}`)
      const tripData = await tripRes.json()
      setTrip(tripData)
      setAlternatesItemId(null)
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 2000)
    } catch {
      setSavingStatus('idle')
      alert('Failed to swap activity. Please try again.')
    }
  }

  async function fetchAddAlternates(dayNumber: number) {
    setLoadingAddAlternates(true)
    setAddAlternates([])
    // Use any item id from the trip to hit the alternates endpoint
    const anyItemId = trip?.itinerary_items[0]?.id
    if (!anyItemId) return
    try {
      const res = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items/${anyItemId}/alternates`
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAddAlternates(data)
    } catch {
      alert('Failed to load recommendations. Please try again.')
    } finally {
      setLoadingAddAlternates(false)
    }
  }

  async function handleAddRecommended(alternate: any, dayNumber: number) {
    setSavingStatus('saving')
    try {
      const res = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            place_id: alternate.place_id,
            activity_id: alternate.activity_id,
            day_number: dayNumber,
            source_type: 'user',
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to add')
      const tripRes = await fetch(`http://localhost:5050/api/v1/trips/${id}`)
      const tripData = await tripRes.json()
      setTrip(tripData)
      setAddingToDayNumber(null)
      setAddMode(null)
      setAddAlternates([])
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 2000)
    } catch {
      setSavingStatus('idle')
      alert('Failed to add activity. Please try again.')
    }
  }

  async function handleAddCustom(dayNumber: number, name: string, address: string, notes: string) {
    setSavingStatus('saving')
    try {
      const res = await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            custom_name: name,
            custom_address: address || null,
            notes: notes || null,
            day_number: dayNumber,
            source_type: 'user',
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to add')
      const tripRes = await fetch(`http://localhost:5050/api/v1/trips/${id}`)
      const tripData = await tripRes.json()
      setTrip(tripData)
      setAddingToDayNumber(null)
      setAddMode(null)
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 2000)
    } catch {
      setSavingStatus('idle')
      alert('Failed to add activity. Please try again.')
    }
  }

  async function handleEditSave(item: ItineraryItem, name: string, address: string, notes: string) {
    setSavingStatus('saving')
    try {
      await fetch(
        `http://localhost:5050/api/v1/trips/${id}/items/${item.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            custom_name: item.source_type === 'user' ? name : undefined,
            custom_address: item.source_type === 'user' ? address : undefined,
            notes: notes,
          }),
        }
      )
      setTrip((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          itinerary_items: prev.itinerary_items.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  notes: notes,
                  custom_name: item.source_type === 'user' ? name : i.custom_name,
                  custom_address: item.source_type === 'user' ? address : i.custom_address,
                  place_name: item.source_type === 'user' ? name : i.place_name,
                }
              : i
          ),
        }
      })
      setEditItemId(null)
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 2000)
    } catch {
      setSavingStatus('idle')
      alert('Failed to save. Please try again.')
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const item = trip?.itinerary_items.find((i) => i.id === event.active.id)
    setActiveItem(item ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !trip) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeItem = trip.itinerary_items.find((i) => i.id === activeId)
    const overItem = trip.itinerary_items.find((i) => i.id === overId)
    if (!activeItem || !overItem) return

    const sourceDayNumber = activeItem.day_number
    const targetDayNumber = overItem.day_number

    // Build new items array with updated day_number and item_order
    const updatedItems = [...trip.itinerary_items]
    const activeIndex = updatedItems.findIndex((i) => i.id === activeId)
    const overIndex = updatedItems.findIndex((i) => i.id === overId)

    // Move the item
    const moved = arrayMove(updatedItems, activeIndex, overIndex)

    // Update day_number for the dragged item if it moved days
    const finalItems = moved.map((item) => {
      if (item.id === activeId) {
        return { ...item, day_number: targetDayNumber }
      }
      return item
    })

    // Recalculate item_order per day
    const dayNumbers = Array.from(new Set(finalItems.map((i) => i.day_number)))
    const reordered = finalItems.map((item) => {
      const dayItems = finalItems
        .filter((i) => i.day_number === item.day_number)
      const order = dayItems.findIndex((i) => i.id === item.id) + 1
      return { ...item, item_order: order }
    })

    // Update local state immediately
    setTrip((prev) => prev ? { ...prev, itinerary_items: reordered } : prev)

    const crossDay = sourceDayNumber !== targetDayNumber
    const affectedDays = crossDay
      ? [sourceDayNumber, targetDayNumber]
      : [sourceDayNumber]

    setSavingStatus('saving')
    try {
      const res = await fetch(`http://localhost:5050/api/v1/trips/${id}/items/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: affectedDays.map((dayNum) => ({
            day_number: dayNum,
            ordered_item_ids: reordered
              .filter((i) => i.day_number === dayNum)
              .sort((a, b) => a.item_order - b.item_order)
              .map((i) => i.id),
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to reorder')
      setSavingStatus('saved')
      setTimeout(() => setSavingStatus('idle'), 2000)
    } catch {
      setSavingStatus('idle')
      alert('Failed to save new order. Please try again.')
    } finally {
      setActiveItem(null)
    }
  }

  useEffect(() => {
    if (!id) return
    async function loadTrip() {
      try {
        setLoading(true)
        setNotFound(false)

        const res = await fetch(`http://localhost:5050/api/v1/trips/${id}`)

        if (res.status === 404){
          setNotFound(true)
          return
        }
        if (!res.ok) {
          throw new Error('Failed to load trip')
        }

        const data = await res.json()
        setTrip(data)
      } catch (err){
        console.error(err)
        setNotFound(true)
      } finally{
        setLoading(false)
      }
    }
    
    loadTrip()
  }, [id])

  if (notFound) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <p className="text-gray-600 mb-6">This itinerary may have been removed or the link is invalid.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/my-trips" className="text-primary-600 font-semibold hover:underline">
              My Trips
            </Link>
            <Link href="/trips" className="text-primary-600 font-semibold hover:underline">
              Explore Trips
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
        <div className="container mx-auto px-6 max-w-6xl space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-xl mt-6" />
        </div>
      </main>
    )
  }

  if (!trip) return null

  const dayNumbers = Array.from(new Set(trip.itinerary_items.map((i) => i.day_number))).sort((a, b) => a - b)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">

        <div className="mb-8">
          <Link
            href="/my-trips"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Trips
          </Link>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{trip.trip.title}</h1>
            <div className="flex items-center gap-3 flex-shrink-0 mt-1 no-print">
              {savingStatus === 'saving' && (
                <span className="text-sm text-gray-400">Saving...</span>
              )}
              {savingStatus === 'saved' && (
                <span className="text-sm text-emerald-600">Saved ✓</span>
              )}
              {!editMode && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export PDF
                </button>
              )}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  editMode
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {editMode ? 'Done Editing' : 'Edit Itinerary'}
              </button>
            </div>
          </div>
          <p className="text-gray-500 mt-1">
            {trip.trip.destination_city}{trip.trip.destination_region ? `, ${trip.trip.destination_region}` : ''} · {formatDateRange(trip.trip.start_date, trip.trip.end_date)}
          </p>
          {trip.preferences?.preferred_categories?.length ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {trip.preferences.preferred_categories.map((c) => (
                <Badge key={c} label={c.replace(/_/g, ' ')} color="purple" />
              ))}
            </div>
          ) : null}
        </div>

        {editMode && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            Edit mode — drag to reorder, or use the icons on each activity to swap, edit, or delete.
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
        <SortableContext
          items={trip.itinerary_items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {dayNumbers.map((dayNumber) => {
            const dayItems = trip.itinerary_items
              .filter((i) => i.day_number === dayNumber)
              .sort((a, b) => a.item_order - b.item_order)
            const dayDate = dayItems[0]?.scheduled_date

            return (
              <section key={dayNumber} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-indigo-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">Day {dayNumber}</h2>
                  {dayDate && (
                    <p className="text-indigo-200 text-sm">{formatDayDate(dayDate)}</p>
                  )}
                </div>

                <ul className="divide-y divide-gray-100">
                  {dayItems.map((item, idx) => (
                    <SortableActivityCard
                      key={item.id}
                      item={item}
                      index={idx}
                      tripId={id}
                      onNotesSaved={handleNotesSaved}
                      editMode={editMode}
                      confirmDeleteId={confirmDeleteId}
                      onRequestDelete={setConfirmDeleteId}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                      onConfirmDelete={handleDelete}
                      alternatesItemId={alternatesItemId}
                      alternatesList={alternates}
                      loadingAlternates={loadingAlternates}
                      onFetchAlternates={fetchAlternates}
                      onSwap={handleSwap}
                      editItemId={editItemId}
                      onRequestEdit={setEditItemId}
                      onEditSave={handleEditSave}
                      onEditCancel={() => setEditItemId(null)}
                    />
                  ))}
                </ul>

{editMode && (
                  addingToDayNumber === dayNumber ? (
                    <AddActivityPanel
                      dayNumber={dayNumber}
                      addMode={addMode}
                      addAlternates={addAlternates}
                      loadingAddAlternates={loadingAddAlternates}
                      onChooseCustom={() => setAddMode('custom')}
                      onChooseRecommendations={() => {
                        setAddMode('recommendations')
                        fetchAddAlternates(dayNumber)
                      }}
                      onAddCustom={handleAddCustom}
                      onAddRecommended={handleAddRecommended}
                      onCancel={() => {
                        setAddingToDayNumber(null)
                        setAddMode(null)
                        setAddAlternates([])
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setAddingToDayNumber(dayNumber)
                        setAddMode('choice')
                      }}
                      className="w-full px-5 py-3 text-xs font-medium text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add activity
                    </button>
                  )
                )}
              </section>
            )
          })}
        </div>
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="bg-white rounded-xl shadow-2xl border border-indigo-200 px-5 py-4 opacity-95">
              <p className="font-semibold text-gray-900 text-sm">{activeItem.place_name}</p>
              {activeItem.category && (
                <p className="text-xs text-gray-500 mt-0.5">{activeItem.category.replace(/_/g, ' ')}</p>
              )}
            </div>
          ) : null}
        </DragOverlay>
        </DndContext>

        <div className="mt-8 flex gap-3 no-print">
          <Link href="/generate" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Plan another trip
          </Link>
          <Link href="/my-trips" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            All my trips
          </Link>
        </div>

      </div>
    </main>
  )
}
