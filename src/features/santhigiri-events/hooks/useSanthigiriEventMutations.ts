import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SanthigiriEventFormValues } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import {
  createSanthigiriEvent,
  deleteSanthigiriEvent,
  startSanthigiriEventOccurrences,
  updateSanthigiriEvent,
} from "@/features/santhigiri-events/api/santhigiriEvents"

export function useCreateSanthigiriEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SanthigiriEventFormValues) =>
      createSanthigiriEvent(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["santhigiri-events"] })
    },
  })
}

export function useUpdateSanthigiriEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventId,
      values,
    }: {
      eventId: string
      values: Omit<SanthigiriEventFormValues, "id">
    }) => updateSanthigiriEvent(eventId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["santhigiri-events"] })
    },
  })
}

export function useGenerateSanthigiriEventOccurrences() {
  return useMutation({
    mutationFn: ({
      eventId,
      startYear,
      endYear,
    }: {
      eventId: string
      startYear: number
      endYear: number
    }) => startSanthigiriEventOccurrences(eventId, startYear, endYear),
  })
}

export function useDeleteSanthigiriEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => deleteSanthigiriEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["santhigiri-events"] })
    },
  })
}
