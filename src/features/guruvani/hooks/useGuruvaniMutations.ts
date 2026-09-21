import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { GuruvaniFormValues } from "@/features/guruvani/schemas/guruvani"
import {
  GURUVANI_CACHE_KEY,
  createGuruvani,
  deleteGuruvani,
  updateGuruvani,
} from "@/features/guruvani/api/guruvani"
import { clearEtagCache } from "@/lib/http/etagCache"

async function invalidateGuruvaniList(queryClient: ReturnType<typeof useQueryClient>) {
  // Drop the cached ETag entry so the refetch below does a normal fetch
  // instead of instantly resolving the now-stale cached list.
  await clearEtagCache(GURUVANI_CACHE_KEY)
  await queryClient.invalidateQueries({ queryKey: ["guruvani"] })
}

export function useCreateGuruvani() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: GuruvaniFormValues) => createGuruvani(values),
    onSuccess: () => invalidateGuruvaniList(queryClient),
  })
}

export function useUpdateGuruvani() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: GuruvaniFormValues }) =>
      updateGuruvani(id, values),
    onSuccess: () => invalidateGuruvaniList(queryClient),
  })
}

export function useDeleteGuruvani() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteGuruvani(id),
    onSuccess: () => invalidateGuruvaniList(queryClient),
  })
}
