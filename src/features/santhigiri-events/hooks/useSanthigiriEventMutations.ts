import { useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  SanthigiriEventFormValues,
  SanthigiriEventGenerateProgress,
} from "@/features/santhigiri-events/schemas/santhigiriEvent"
import {
  createSanthigiriEvent,
  deleteSanthigiriEvent,
  generateSanthigiriEventOccurrences,
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

export function useGenerateSanthigiriEventOccurrences(
  onProgress?: (progress: SanthigiriEventGenerateProgress) => void
) {
  return useMutation({
    mutationFn: ({
      eventId,
      startYear,
      endYear,
    }: {
      eventId: string
      startYear: number
      endYear: number
    }) =>
      generateSanthigiriEventOccurrences(
        eventId,
        startYear,
        endYear,
        onProgress
      ),
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
