import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getGuruvaniOfTheDay, getGuruvanis } from "@/features/guruvani/api/guruvani"
import { dateToKey } from "@/lib/date"

const GURUVANI_QUERY_KEY = ["guruvani"]

export function useGuruvanis() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: GURUVANI_QUERY_KEY,
    queryFn: () => getGuruvanis((data) => queryClient.setQueryData(GURUVANI_QUERY_KEY, data)),
    // The list is ETag-validated (see fetchWithEtag): resolves instantly
    // from the cached value and revalidates in the background, so there's
    // no benefit to holding onto "fresh" data between refetches.
    staleTime: 0,
  })
}

export function useRandomGuruvani() {
  const dayKey = dateToKey(new Date())

  // The day-key in the query key is what "invalidates" this on a day
  // rollover — a new day naturally produces a new query rather than
  // refetching under the same key. staleTime: Infinity means TanStack Query
  // never refetches within the day; getGuruvaniOfTheDay's IndexedDB cache is
  // what makes the day's pick survive reloads/app restarts.
  return useQuery({
    queryKey: ["guruvani-random", dayKey],
    queryFn: () => getGuruvaniOfTheDay(dayKey),
    staleTime: Infinity,
    retry: false,
  })
}
