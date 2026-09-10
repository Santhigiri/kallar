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


export function addDay(dt: Date, offset: number): Date {
  const result = new Date(dt)
  result.setDate(result.getDate() + offset)
  return result
}
