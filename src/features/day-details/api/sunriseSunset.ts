import type { SunriseSunsetData } from "@/features/day-details/schemas/sunriseSunset"
import { sunriseSunsetData, sunriseSunsetRangeData } from "@/features/day-details/schemas/sunriseSunset"
import { readSunriseSunsetCache, writeSunriseSunsetCache } from "@/features/day-details/api/sunriseSunsetCache"
import { dateToKey } from "@/lib/date"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

// On a cache miss, fetch a window of days around the requested one in a
// single request instead of just the one day — the day-details page's
// prev/next navigation moves one day at a time, so this turns a string of
// single-day fetches into one range fetch every ~2 weeks of paging.
const WINDOW_DAYS_BEFORE = 7
const WINDOW_DAYS_AFTER = 7

export async function getSunriseSunset(
  day: Date,
  latitude: number,
  longitude: number
): Promise<SunriseSunsetData> {
  const dayKey = dateToKey(day)

  // Sunrise/sunset is deterministic for a given (day, location) — once
  // fetched it never changes, so a cache hit skips the network entirely
  // rather than revalidating in the background.
  const cached = await readSunriseSunsetCache(dayKey, latitude, longitude)
  if (cached) {
    try {
      return sunriseSunsetData.parse(cached)
    } catch {
      // Cached payload no longer matches the schema — fall through to a fresh fetch.
    }
  }

  const start = new Date(day)
  start.setDate(start.getDate() - WINDOW_DAYS_BEFORE)
  const end = new Date(day)
  end.setDate(end.getDate() + WINDOW_DAYS_AFTER)

  const results = await getSunriseSunsetRange(start, end, latitude, longitude)
  const own = results[dayKey]
  if (!own) {
    throw new Error(`Sunrise/sunset range response did not include ${dayKey}`)
  }
  return { latitude, longitude, day: dayKey, sunrise: own.sunrise, sunset: own.sunset }
}

// Fetches sunrise/sunset for every day in [start, end] in one request, caching
// each day individually so later single-day/window lookups within the range
// are served from the cache. Returns a plain day-key -> {sunrise, sunset} map.
export async function getSunriseSunsetRange(
  start: Date,
  end: Date,
  latitude: number,
  longitude: number
): Promise<Partial<Record<string, { sunrise: string; sunset: string }>>> {
  const params = new URLSearchParams({
    start_date: dateToKey(start),
    end_date: dateToKey(end),
    latitude: String(latitude),
    longitude: String(longitude),
  })

  const response = await fetch(`${APP_BASE_URL}/api/v1/panchangam/sunrise-sunset/range?${params}`, {
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sunrise/sunset range: ${response.status}`)
  }

  const json = await response.json()
  const data = sunriseSunsetRangeData.parse(json)

  await Promise.all(
    Object.entries(data.results).map(([dayKey, value]) =>
      writeSunriseSunsetCache(dayKey, latitude, longitude, {
        latitude,
        longitude,
        day: dayKey,
        sunrise: value.sunrise,
        sunset: value.sunset,
      })
    )
  )

  return data.results
}
