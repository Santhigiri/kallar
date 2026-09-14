import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getLocaleForTimezone } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFormattedDate(datetime: string): string {

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric'
  };

  const locale = 'en-IN'

  return new Date(datetime).toLocaleString(locale, options)
}


export function getFormattedTime(datetime: string, timeZone?: string, showTimezoneName: boolean = true): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric', minute: 'numeric',
    hour12: true,
    ...(showTimezoneName ? { timeZoneName: 'short' } : {}),
    ...(timeZone ? { timeZone } : {}),
  };

  return new Date(datetime).toLocaleTimeString(getLocaleForTimezone(timeZone), options)
}

export function getFormattedDateTime(
  datetime: string | null,
  timeZone?: string,
  showTimezoneName: boolean = false
): string {

  if (datetime === null) return ""

  const options: Intl.DateTimeFormatOptions = {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    hour12: true,
    ...(showTimezoneName ? { timeZoneName: 'short' } : {}),
    ...(timeZone ? { timeZone } : {}),
  };

  const locale = 'en-IN'

  return new Date(datetime).toLocaleString(locale, options)
}


export function getFormattedTimeWithRelativeDay(datetime: string, timeZone?: string): string {
  const time = getFormattedTime(datetime, timeZone)

  // "Today"/"tomorrow" are relative to the viewer's own calendar day (same
  // notion the rest of the app uses, e.g. dateToKey/isToday), not the day in
  // `timeZone` — a viewer far behind the displayed location (e.g. Canada
  // viewing Santhigiri's IST times) would otherwise get the location's
  // already-rolled-over date instead of their own "today".
  const target = new Date(datetime)
  const now = new Date()

  const toLocalDays = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000
  const dayDiff = toLocalDays(target) - toLocalDays(now)

  if (dayDiff === 0) return `today, ${time}`
  if (dayDiff === 1) return `tomorrow, ${time}`

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
