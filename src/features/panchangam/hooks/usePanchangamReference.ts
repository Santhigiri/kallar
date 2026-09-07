import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getLocationsReference,
  getMasaReference,
  getNakshatraReference,
  getSanthigiriEvents,
  getThithiReference,
} from "@/features/panchangam/api/panchangamReference"

const REFERENCE_STALE_TIME = 1000 * 60 * 60 * 24 // reference data changes rarely

export function useNakshatraReference() {
  const queryClient = useQueryClient()
  const queryKey = ["nakshatra-reference"]
  return useQuery({
    queryKey,
    queryFn: () => getNakshatraReference((data) => queryClient.setQueryData(queryKey, data)),
    staleTime: REFERENCE_STALE_TIME,
  })
}

export function useThithiReference() {
  const queryClient = useQueryClient()
  const queryKey = ["thithi-reference"]
  return useQuery({
    queryKey,
    queryFn: () => getThithiReference((data) => queryClient.setQueryData(queryKey, data)),
    staleTime: REFERENCE_STALE_TIME,
  })
}

export function useMasaReference() {
  const queryClient = useQueryClient()
  const queryKey = ["masa-reference"]
  return useQuery({
    queryKey,
    queryFn: () => getMasaReference((data) => queryClient.setQueryData(queryKey, data)),
    staleTime: REFERENCE_STALE_TIME,
  })
}

export function useSanthigiriEvents() {
  const queryClient = useQueryClient()
  const queryKey = ["santhigiri-events"]
  return useQuery({
    queryKey,
    queryFn: () => getSanthigiriEvents((data) => queryClient.setQueryData(queryKey, data)),
    staleTime: REFERENCE_STALE_TIME,
  })
}

export function useLocationsReference() {
  const queryClient = useQueryClient()
  const queryKey = ["locations-reference"]
  return useQuery({
    queryKey,
    queryFn: () => getLocationsReference((data) => queryClient.setQueryData(queryKey, data)),
    staleTime: REFERENCE_STALE_TIME,
  })
}
