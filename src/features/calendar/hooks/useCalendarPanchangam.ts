import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PanchangamDayData } from "@/features/panchangam/schemas/panchangamData";
import { getPanchangamYear } from "@/features/panchangam/api/panchangamGeneration";
import { useReferenceMaps } from "@/features/panchangam/hooks/useReferenceMaps";
import { enrichPanchangamDay } from "@/features/panchangam/lib/enrichPanchangamData";
import { CALENDAR_END_DATE, CALENDAR_START_DATE } from "@/lib/constants";
import { dateToKey } from "@/lib/date";
import { useSelectedLocation } from "@/hooks/useSelectedLocation";

export function useCalendarPanchangam(initialActiveDate = new Date()) {
  const [activeDate, setActiveDate] = useState<Date>(initialActiveDate);
  const { locationCode } = useSelectedLocation()
  const year = activeDate.getFullYear()
  const queryClient = useQueryClient()

  const previousYear = year - 1
  const nextYear = year + 1
  const hasPreviousYear = previousYear >= CALENDAR_START_DATE.getFullYear()
  const hasNextYear = nextYear <= CALENDAR_END_DATE.getFullYear()

  const yearQueryKey = ["panchangam-year-v1", year, locationCode]
  const previousYearQueryKey = ["panchangam-year-v1", previousYear, locationCode]
  const nextYearQueryKey = ["panchangam-year-v1", nextYear, locationCode]

  // staleTime: 0 — always revalidate on mount/focus; the yearly endpoint is
  // ETag-validated, and getPanchangamYear resolves instantly from the cached
  // value while quietly revalidating in the background (see
  // fetchWithEtag's onBackgroundUpdate), so this never blocks on the network.
  const yearQuery = useQuery({
    queryKey: yearQueryKey,
    queryFn: () =>
      getPanchangamYear(year, locationCode, (data) => queryClient.setQueryData(yearQueryKey, data)),
    staleTime: 0,
  })

  // Fetched (not just prefetched) so their data is available for the outside
  // days the calendar grid shows from the neighbouring month — e.g. viewing
  // December, the January-next-year outside days need next year's data,
  // which lives under a different ETag than the active year. This also
  // doubles as the "prefetch ahead of navigation" warming: jumping to
  // Dec→Jan (or the year selector) hits an already-cached/ETag-validated
  // query instead of a cold fetch.
  const previousYearQuery = useQuery({
    queryKey: previousYearQueryKey,
    queryFn: () =>
      getPanchangamYear(previousYear, locationCode, (data) =>
        queryClient.setQueryData(previousYearQueryKey, data)
      ),
    staleTime: 0,
    enabled: hasPreviousYear,
  })
  const nextYearQuery = useQuery({
    queryKey: nextYearQueryKey,
    queryFn: () =>
      getPanchangamYear(nextYear, locationCode, (data) =>
        queryClient.setQueryData(nextYearQueryKey, data)
      ),
    staleTime: 0,
    enabled: hasNextYear,
  })

  const { referenceMaps, isLoading: isReferenceLoading } = useReferenceMaps()

  const isLoading = yearQuery.isLoading || isReferenceLoading

  const monthData = useMemo(() => {
    if (!yearQuery.data) return undefined
    const combined = {
      ...previousYearQuery.data,
      ...yearQuery.data,
      ...nextYearQuery.data,
    }
    const enriched: Record<string, PanchangamDayData> = {}
    for (const [key, compact] of Object.entries(combined)) {
      enriched[key] = enrichPanchangamDay(compact, referenceMaps)
    }
    return enriched
  }, [yearQuery.data, previousYearQuery.data, nextYearQuery.data, referenceMaps])

  // Derived keys
  const [monthStartDate, monthEndDate] = useMemo(() => [
    new Date(activeDate.getFullYear(), activeDate.getMonth(), 1),
    new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0),
  ], [activeDate]);

  const startKey = dateToKey(monthStartDate);
  const endKey = dateToKey(monthEndDate);

  // Month events
  const monthEvents = useMemo(() => {
    if (!monthData) return [];
    const yr = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const daysInMonth = new Date(yr, month + 1, 0).getDate();
    const monthDates = Array.from({ length: daysInMonth }, (_, i) => new Date(yr, month, i + 1));

    return monthDates.flatMap((dt) => {
      const key = dateToKey(dt);
      const dayData = (monthData as Record<string, PanchangamDayData | undefined>)[key];
      if (!dayData) return [];
      return dayData.santhigiri_significant_dates.map((e) => ({ dt, key, e }));
    });
  }, [monthData, activeDate]);

  return {
    activeDate,
    setActiveDate,
    monthData,
    isLoading,
    startKey,
    endKey,
    monthEvents,
    monthStartDate,
    monthEndDate,
  };
}
