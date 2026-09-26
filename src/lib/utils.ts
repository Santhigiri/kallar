import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getLocaleForTimezone } from "./constants";
import i18n from "./i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Panchangam domain values (nakshatra, thithi, paksha, masa, ...) come back
// from the v2 reference endpoints as a `translations` row per language code
// — this picks the text matching the active UI language, falling back to
// English, then to the untranslated enum `name` (e.g. "ASWATHI") for any
// item the translation tables haven't been seeded for yet.
export function localizedName(
  item: { name: string; translations: Array<{ language_code: string; text: string }> },
  language: string
): string {
  return (
    item.translations.find((t) => t.language_code === language)?.text ??
    item.translations.find((t) => t.language_code === "en")?.text ??
    item.name
  )
}

export function getFormattedDate(datetime: string): string {

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric'
  };

  const locale = 'en-IN'

  return new Date(datetime).toLocaleString(locale, options)
}


// When `timeZoneAbbreviation` is supplied (the ip-geolocation service's own
// short name, e.g. "IST"/"EDT") it is used verbatim instead of asking Intl to
// derive one via `timeZoneName: 'short'` — that option is unreliable for IANA
// zones without a widely-recognized abbreviation (e.g. it renders
// "GMT+5:30" for Asia/Kolkata rather than "IST").
export function getFormattedTime(
  datetime: string,
  timeZone?: string,
  showTimezoneName: boolean = true,
  timeZoneAbbreviation?: string
): string {
  const useComputedTimezoneName = showTimezoneName && !timeZoneAbbreviation

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric', minute: 'numeric',
    hour12: true,
    ...(useComputedTimezoneName ? { timeZoneName: 'short' } : {}),
    ...(timeZone ? { timeZone } : {}),
  };

  const formatted = new Date(datetime).toLocaleTimeString(getLocaleForTimezone(timeZone), options)

  return showTimezoneName && timeZoneAbbreviation ? `${formatted} ${timeZoneAbbreviation}` : formatted
}

export function getFormattedDateTime(
  datetime: string | null,
  timeZone?: string,
  showTimezoneName: boolean = false,
  timeZoneAbbreviation?: string
): string {

  if (datetime === null) return ""

  const useComputedTimezoneName = showTimezoneName && !timeZoneAbbreviation

  const options: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    hour12: true,
    ...(useComputedTimezoneName ? { timeZoneName: 'short' } : {}),
    ...(timeZone ? { timeZone } : {}),
  };

  const locale = 'en-IN'

  const formatted = new Date(datetime).toLocaleString(locale, options)

  return showTimezoneName && timeZoneAbbreviation ? `${formatted} ${timeZoneAbbreviation}` : formatted
}


export function getFormattedTimeWithRelativeDay(datetime: string, timeZone?: string, timeZoneAbbreviation?: string): string {
  const time = getFormattedTime(datetime, timeZone, true, timeZoneAbbreviation)

  // "Today"/"tomorrow" are relative to the viewer's own calendar day (same
  // notion the rest of the app uses, e.g. dateToKey/isToday), not the day in
  // `timeZone` — a viewer far behind the displayed location (e.g. Canada
  // viewing Santhigiri's IST times) would otherwise get the location's
  // already-rolled-over date instead of their own "today".
  const target = new Date(datetime)
  const now = new Date()

  const toLocalDays = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000
  const dayDiff = toLocalDays(target) - toLocalDays(now)

  if (dayDiff === 0) return `${i18n.t("common.today")}, ${time}`
  if (dayDiff === 1) return `${i18n.t("common.tomorrow")}, ${time}`

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  };

  const dateStr = new Intl.DateTimeFormat('en-IN', dateOptions).format(new Date(datetime))

  return `${dateStr}, ${time}`
}

export function addDay(dt: Date, offset: number): Date {
  const result = new Date(dt)
  result.setDate(result.getDate() + offset)
  return result
}
