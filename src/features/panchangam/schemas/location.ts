import * as z from "zod"

export const locationInfo = z.object({
  code: z.string(),
  label: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  // Only populated for the ip-derived "Current Location" option (see
  // useLocationOptions) — backend reference locations don't carry one, so
  // display code falls back to the Intl-computed short name for those.
  timezoneAbbreviation: z.string().optional(),
})

export type LocationInfo = z.infer<typeof locationInfo>
