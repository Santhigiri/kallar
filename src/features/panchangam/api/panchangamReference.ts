import * as z from "zod"
import { masa, nakshatra, thithi } from "../schemas/panchangamData"
import { locationInfo } from "../schemas/location"
import type { SanthigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import type { Masa, Nakshatra, Thithi } from "../schemas/panchangamData"
import type { LocationInfo } from "../schemas/location"
import { santhigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import { fetchWithEtag } from "@/lib/http/conditionalFetch"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

function fetchReference<T>(path: string, schema: z.ZodType<T>, onBackgroundUpdate?: (data: T) => void) {
  return fetchWithEtag(`${APP_BASE_URL}/api/v1/panchangam/${path}`, path, schema, { onBackgroundUpdate })
}

export function getNakshatraReference(onBackgroundUpdate?: (data: Array<Nakshatra>) => void) {
  return fetchReference("nakshatra", z.array(nakshatra), onBackgroundUpdate)
}

export function getThithiReference(onBackgroundUpdate?: (data: Array<Thithi>) => void) {
  return fetchReference("thithi", z.array(thithi), onBackgroundUpdate)
}

export function getSanthigiriEvents(onBackgroundUpdate?: (data: Array<SanthigiriEvent>) => void) {
  return fetchReference("events", z.array(santhigiriEvent), onBackgroundUpdate)
}

export function getMasaReference(onBackgroundUpdate?: (data: Array<Masa>) => void) {
  return fetchReference("masa", z.array(masa), onBackgroundUpdate)
}

export function getLocationsReference(onBackgroundUpdate?: (data: Array<LocationInfo>) => void) {
  return fetchReference("locations", z.array(locationInfo), onBackgroundUpdate)
}
