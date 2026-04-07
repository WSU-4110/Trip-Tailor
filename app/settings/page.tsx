'use client'

import { useTheme } from '@/lib/theme-context'

const OPTIONS: { value: 'system' | 'light' | 'dark'; label: string; description: string }[] = [
  {
    value: 'system',
    label: 'System default',
    description: 'Match your device appearance automatically.',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use a light theme.',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use a dark theme.',
  },
]

export default function SettingsPage() {
  const { theme, effectiveTheme, setTheme } = useTheme()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Choose how TripTailor looks. Your preference is saved on this device.
        </p>

        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 dark:border dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Current effective theme: <span className="font-medium capitalize">{effectiveTheme}</span>
          </p>
          <div className="space-y-3">
            {OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-slate-600 px-4 py-3 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer"
              >
                <input
                  type="radio"
                  name="theme"
                  value={opt.value}
                  checked={theme === opt.value}
                  onChange={() => setTheme(opt.value)}
                  className="mt-1 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

