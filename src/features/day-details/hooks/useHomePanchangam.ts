import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays } from "date-fns";
import type { PanchangamDayData, SanthigiriSignificance } from "@/features/panchangam/schemas/panchangamData";
import { getPanchangamYear } from "@/features/panchangam/api/panchangamGeneration";
import { useReferenceMaps } from "@/features/panchangam/hooks/useReferenceMaps";
import { dateToKey } from "@/lib/date";
import { enrichPanchangamDay } from "@/features/panchangam/lib/enrichPanchangamData";
import { CALENDAR_END_DATE, CALENDAR_START_DATE } from "@/lib/constants";
import { useSelectedLocation } from "@/hooks/useSelectedLocation";

// How far ahead to scan for "upcoming events" — long enough to surface the
// next recurring observance (Pournami etc.), short enough to stay relevant
// on a homepage rather than listing things a month away.
const UPCOMING_WINDOW_DAYS = 30
const MAX_UPCOMING_EVENTS = 5

export type UpcomingEvent = {
  date: Date
  event: SanthigiriSignificance
}

export function useHomePanchangam(initialActiveDate = new Date()) {
  const [activeDate, setActiveDate] = useState<Date>(initialActiveDate);
  const { locationCode } = useSelectedLocation()
  const year = activeDate.getFullYear()
  const queryClient = useQueryClient()

  const windowEndYear = addDays(activeDate, UPCOMING_WINDOW_DAYS).getFullYear()
  const nextYear = year + 1
  const needsNextYear = windowEndYear > year && nextYear <= CALENDAR_END_DATE.getFullYear()

  const yearQueryKey = ["panchangam-year-v1", year, locationCode]
  const nextYearQueryKey = ["panchangam-year-v1", nextYear, locationCode]

  // staleTime: 0 — always revalidate on mount/focus; the yearly endpoint is
  // ETag-validated, and getPanchangamYear resolves instantly from the cached
  // value while quietly revalidating in the background.
  const yearQuery = useQuery({
    queryKey: yearQueryKey,
    queryFn: () =>
      getPanchangamYear(year, locationCode, (data) => queryClient.setQueryData(yearQueryKey, data)),
    staleTime: 0,
    enabled: year >= CALENDAR_START_DATE.getFullYear() && year <= CALENDAR_END_DATE.getFullYear(),
  })

  // Only fetched when the upcoming-events window actually crosses into next
  // year (e.g. viewing late December) — same query key shape as the calendar
  // page's hook, so it shares cache with it.
  const nextYearQuery = useQuery({
    queryKey: nextYearQueryKey,
    queryFn: () =>
      getPanchangamYear(nextYear, locationCode, (data) =>
        queryClient.setQueryData(nextYearQueryKey, data)
      ),
    staleTime: 0,
    enabled: needsNextYear,
  })

  const { referenceMaps, isLoading: isReferenceLoading } = useReferenceMaps()

  const isLoading = yearQuery.isLoading || isReferenceLoading

  const enrichedDays = useMemo(() => {
    if (!yearQuery.data) return undefined
    const combined = {
      ...yearQuery.data,
      ...nextYearQuery.data,
    }
    const enriched: Record<string, PanchangamDayData> = {}
    for (const [key, compact] of Object.entries(combined)) {
      enriched[key] = enrichPanchangamDay(compact, referenceMaps)
    }
    return enriched
  }, [yearQuery.data, nextYearQuery.data, referenceMaps])

  const activeDateData = enrichedDays?.[dateToKey(activeDate)]

  const upcomingEvents = useMemo<Array<UpcomingEvent>>(() => {
    if (!enrichedDays) return []

    const events: Array<UpcomingEvent> = []
    for (let i = 0; i < UPCOMING_WINDOW_DAYS && events.length < MAX_UPCOMING_EVENTS; i++) {
      const date = addDays(activeDate, i)
      const dayData = (enrichedDays as Record<string, PanchangamDayData | undefined>)[dateToKey(date)]
      if (!dayData) continue
      for (const event of dayData.santhigiri_significant_dates) {
        events.push({ date, event })
        if (events.length >= MAX_UPCOMING_EVENTS) break
      }
    }
    return events
  }, [enrichedDays, activeDate])

  return {
    activeDate,
    setActiveDate,
    activeDateData,
    upcomingEvents,
    isLoading,
  };
}
