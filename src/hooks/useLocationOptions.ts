import { useMemo } from "react"
import type { LocationInfo } from "@/features/panchangam/schemas/location"
import { useLocationsReference } from "@/features/panchangam/hooks/usePanchangamReference"
import { useIpLocation } from "@/features/day-details/hooks/useIpLocation"

// Pseudo location code for the visitor's ip-resolved position — never a real
// backend location code, so it must never be sent to a panchangam data
// endpoint (those only know precomputed reference locations).
export const CURRENT_LOCATION_CODE = "current"

// The full set of locations the location picker offers: every backend
// reference location (Trivandrum, ...) plus the visitor's ip-derived
// position, once resolved. Both shapes carry lat/lon/timezone so any
// selection can drive a live sunrise/sunset lookup the same way.
export function useLocationOptions() {
  const { data: referenceLocations, isLoading: isReferenceLoading } = useLocationsReference()
  const { data: ipLocation, isLoading: isIpLoading } = useIpLocation()

  const options = useMemo<Array<LocationInfo>>(() => {
    const list = [...(referenceLocations ?? [])]
    if (ipLocation) {
      list.push({
        code: CURRENT_LOCATION_CODE,
        label: "Current Location",
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
        timezone: ipLocation.timezone,
      })
    }
    return list
  }, [referenceLocations, ipLocation])

  return { options, isLoading: isReferenceLoading || isIpLoading }
}
