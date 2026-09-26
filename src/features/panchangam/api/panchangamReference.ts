import * as z from "zod"
import { masa, nakshatra, thithi } from "../schemas/panchangamData"
import { locationInfo } from "../schemas/location"
import type { SanthigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import type { Masa, Nakshatra, Thithi } from "../schemas/panchangamData"
import type { LocationInfo } from "../schemas/location"
import { santhigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import { fetchWithEtag } from "@/lib/http/conditionalFetch"
import { envelope } from "@/lib/http/apiEnvelope"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

function fetchReference<T>(
  version: "v1" | "v2",
  path: string,
  schema: z.ZodType<T>,
  onBackgroundUpdate?: (data: T) => void
) {
  return fetchWithEtag(`${APP_BASE_URL}/api/${version}/panchangam/${path}`, path, schema, { onBackgroundUpdate })
}

// thithi/nakshatra/masa/chandra-masa moved to v2, which reads from the new
// translation tables (translations: [{language_code, text}]) instead of the
// v1 endpoints' fixed ml/en columns — see panchangamData.ts's `thithi`/
// `nakshatra`/`masa` schemas.
export function getNakshatraReference(onBackgroundUpdate?: (data: Array<Nakshatra>) => void) {
  return fetchReference("v2", "nakshatra", envelope(z.array(nakshatra)), onBackgroundUpdate)
}

export function getThithiReference(onBackgroundUpdate?: (data: Array<Thithi>) => void) {
  return fetchReference("v2", "thithi", envelope(z.array(thithi)), onBackgroundUpdate)
}

// No v2 equivalent — v2's events router only exposes CRUD-by-id endpoints,
// not this compact reference list.
export function getSanthigiriEvents(onBackgroundUpdate?: (data: Array<SanthigiriEvent>) => void) {
  return fetchReference("v1", "events", z.array(santhigiriEvent), onBackgroundUpdate)
}

export function getMasaReference(onBackgroundUpdate?: (data: Array<Masa>) => void) {
  return fetchReference("v2", "masa", envelope(z.array(masa)), onBackgroundUpdate)
}

export function getChandraMasaReference(onBackgroundUpdate?: (data: Array<Masa>) => void) {
  return fetchReference("v2", "chandra-masa", envelope(z.array(masa)), onBackgroundUpdate)
}

// No v2 equivalent.
export function getLocationsReference(onBackgroundUpdate?: (data: Array<LocationInfo>) => void) {
  return fetchReference("v1", "locations", z.array(locationInfo), onBackgroundUpdate)
}
