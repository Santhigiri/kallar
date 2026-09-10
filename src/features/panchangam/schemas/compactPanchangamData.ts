import * as z from "zod"

const isoDatetime = z.string().refine((val) => !Number.isNaN(Date.parse(val)))

export const compactKollavarshamDate = z.object({
  kv_day: z.number().int(),
  kv_year: z.number().int(),
  masa: z.string(),
})

export const compactLocation = z.object({
  code: z.string(),
  label: z.string(),
})

export const compactThithiTransition = z.object({
  thithi: z.string(),
  start_time: isoDatetime,
  end_time: isoDatetime.nullable(),
})

export const compactNakshatraTransition = z.object({
  nakshatra: z.string(),
  start_time: isoDatetime,
  end_time: isoDatetime.nullable(),
})

export const compactPanchangamData = z.object({
  date: z.iso.date(),
  kv: compactKollavarshamDate,
  location: compactLocation.nullable().optional(),
  nakshatra: z.string(),
  nakshatra_transitions: z.array(compactNakshatraTransition),
  nazhika_from_sunrise: z.number(),
  santhigiri_significant_dates: z.array(z.string()).default([]),
  sunrise: isoDatetime,
  sunset: isoDatetime,
  thithi: z.string(),
  thithi_transitions: z.array(compactThithiTransition),
})

export type CompactPanchangamData = z.infer<typeof compactPanchangamData>

export const panchangamGenerateResult = z.object({
  type: z.literal("complete"),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  count: z.number().int(),
  years: z.array(z.number().int()),
})

export type PanchangamGenerateResult = z.infer<typeof panchangamGenerateResult>

export const panchangamGenerateProgress = z.object({
  type: z.literal("progress"),
  completed: z.number().int(),
  total: z.number().int(),
  percent: z.number(),
  current_date: z.iso.date(),
  elapsed_seconds: z.number(),
})

export type PanchangamGenerateProgress = z.infer<typeof panchangamGenerateProgress>

export const panchangamGenerateError = z.object({
  type: z.literal("error"),
  detail: z.string(),
})

export const panchangamGenerateLine = z.discriminatedUnion("type", [
  panchangamGenerateProgress,
  panchangamGenerateResult,
  panchangamGenerateError,
])
