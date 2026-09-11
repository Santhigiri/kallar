import { useQuery } from "@tanstack/react-query"
import { getIpLocation } from "@/features/day-details/api/ipLocation"

// Resolved once per session (staleTime/gcTime: Infinity) rather than
// re-fetched on every date navigation — the visitor's location doesn't
// change while browsing different days.
export function useIpLocation() {
  return useQuery({
    queryKey: ["ip-location"],
    queryFn: getIpLocation,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  })
}
