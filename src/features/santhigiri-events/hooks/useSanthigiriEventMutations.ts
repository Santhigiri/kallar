import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SanthigiriEventFormValues } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import type { SanthigiriEventGenerateStreamEvent } from "@/features/santhigiri-events/api/santhigiriEvents"
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
      onEvent,
    }: {
      eventId: string
      startYear: number
      endYear: number
      onEvent?: (event: SanthigiriEventGenerateStreamEvent) => void
    }) => startSanthigiriEventOccurrences(eventId, startYear, endYear, onEvent),
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
