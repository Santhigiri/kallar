import { useQuery } from "@tanstack/react-query"
import { getSunriseSunset } from "@/features/day-details/api/sunriseSunset"
import { dateToKey } from "@/lib/date"

export type SunriseSunsetLocation = {
  latitude: number
  longitude: number
  timezone: string
}

// Sunrise/sunset for whichever location is currently selected (the ip-derived
// "Current Location" or a reference location like Trivandrum) — location is
// undefined while that selection is still resolving (e.g. the IP lookup).
export function useLocalSunriseSunset(date: Date, location: SunriseSunsetLocation | undefined) {
  const sunriseSunsetQuery = useQuery({
    queryKey: ["sunrise-sunset", dateToKey(date), location?.latitude, location?.longitude],
    queryFn: () => getSunriseSunset(date, location!.latitude, location!.longitude),
    enabled: !!location,
  })

  return {
    sunrise: sunriseSunsetQuery.data?.sunrise,
    sunset: sunriseSunsetQuery.data?.sunset,
    timeZone: location?.timezone,
    isLoading: sunriseSunsetQuery.isLoading,
  }
}
