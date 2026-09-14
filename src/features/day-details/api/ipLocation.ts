import * as z from "zod"

const IP_LOCATION_URL = "https://ipwho.is/"

const ipLocationResponse = z.object({
  success: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.object({
    id: z.string(),
    abbr: z.string(),
  }),
})

export type IpLocation = {
  latitude: number
  longitude: number
  timezone: string
  timezoneAbbreviation: string
}

export async function getIpLocation(): Promise<IpLocation> {
  const response = await fetch(IP_LOCATION_URL, {
    headers: { Accept: "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to resolve IP location: ${response.status}`)
  }

  const json = await response.json()
  const parsed = ipLocationResponse.parse(json)

  if (!parsed.success) {
    throw new Error("IP location lookup was unsuccessful")
  }

  return {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    timezone: parsed.timezone.id,
    timezoneAbbreviation: parsed.timezone.abbr,
  }
}
