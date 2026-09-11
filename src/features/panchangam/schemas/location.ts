import * as z from "zod"

export const locationInfo = z.object({
  code: z.string(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
})

export type LocationInfo = z.infer<typeof locationInfo>
