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


function getDateKeyInTimeZone(date: Date, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    ...(timeZone ? { timeZone } : {}),
  };

  return new Intl.DateTimeFormat('en-CA', options).format(date)
}

export function getFormattedTimeWithRelativeDay(datetime: string, timeZone?: string): string {
  const time = getFormattedTime(datetime, timeZone)

  const targetKey = getDateKeyInTimeZone(new Date(datetime), timeZone)
  const todayKey = getDateKeyInTimeZone(new Date(), timeZone)

  const toUtcDays = (key: string) => Date.UTC(...key.split('-').map(Number) as [number, number, number]) / 86400000
  const dayDiff = toUtcDays(targetKey) - toUtcDays(todayKey)

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
