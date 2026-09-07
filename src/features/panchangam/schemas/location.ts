import * as z from "zod"

export const locationInfo = z.object({
  code: z.string(),
  label: z.string(),
})

export type LocationInfo = z.infer<typeof locationInfo>
