import * as z from "zod"

const isoDatetime = z.string().refine((val) => {
  return !Number.isNaN(Date.parse(val))
})

export const sunriseSunsetData = z.object({
  latitude: z.number(),
  longitude: z.number(),
  day: z.iso.date(),
  sunrise: isoDatetime,
  sunset: isoDatetime,
})

export type SunriseSunsetData = z.infer<typeof sunriseSunsetData>

const sunriseSunsetDay = z.object({
  sunrise: isoDatetime,
  sunset: isoDatetime,
})

export const sunriseSunsetRangeData = z.object({
  latitude: z.number(),
  longitude: z.number(),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  results: z.record(z.iso.date(), sunriseSunsetDay),
})

export type SunriseSunsetRangeData = z.infer<typeof sunriseSunsetRangeData>
