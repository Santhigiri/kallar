import type { CompactPanchangamData } from "@/features/panchangam/schemas/compactPanchangamData"
import type { SanthigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import type {
  Masa,
  Nakshatra,
  PanchangamDayData,
  ReferenceTranslation,
  SanthigiriSignificance,
  Thithi,
} from "@/features/panchangam/schemas/panchangamData"
import { localizedName } from "@/lib/utils"

export type ReferenceMaps = {
  nakshatraByName: Map<string, Nakshatra>
  thithiByName: Map<string, Thithi>
  masaByName: Map<string, Masa>
  eventById: Map<string, SanthigiriEvent>
}

function fallbackTranslations(code: string): Array<ReferenceTranslation> {
  return [
    { language_code: "en", text: code },
    { language_code: "ml", text: code },
  ]
}

function nakshatraOrFallback(map: Map<string, Nakshatra>, code: string): Nakshatra {
  return map.get(code) ?? { name: code, id: 0, translations: fallbackTranslations(code) }
}

function thithiOrFallback(map: Map<string, Thithi>, code: string): Thithi {
  return (
    map.get(code) ?? {
      name: code,
      id: 0,
      day: 0,
      translations: fallbackTranslations(code),
      paksha: { name: code, id: 0, translations: fallbackTranslations(code) },
    }
  )
}

function masaOrFallback(map: Map<string, Masa>, code: string): Masa {
  return map.get(code) ?? { name: code, id: 0, translations: fallbackTranslations(code) }
}

function eventOrFallback(map: Map<string, SanthigiriEvent>, id: string): SanthigiriSignificance {
  const event = map.get(id)
  return event ? { id: id, name: event.name, description: event.description } : { id: id, name: id, description: "" }
}

export function enrichPanchangamDay(
  compact: CompactPanchangamData,
  refs: ReferenceMaps
): PanchangamDayData {
  const masaInfo = masaOrFallback(refs.masaByName, compact.kv.masa)

  return {
    date: compact.date,
    kv: {
      kv_day: compact.kv.kv_day,
      kv_month: masaInfo.id,
      kv_year: compact.kv.kv_year,
      kv_month_name_en: localizedName(masaInfo, "en"),
      kv_month_name_ml: localizedName(masaInfo, "ml"),
    },
    nakshatra: nakshatraOrFallback(refs.nakshatraByName, compact.nakshatra),
    thithi: thithiOrFallback(refs.thithiByName, compact.thithi),
    thithi_transitions: compact.thithi_transitions.map((transition, idx) => ({
      name: `thithi-transition-${idx}`,
      thithi: thithiOrFallback(refs.thithiByName, transition.thithi),
      start_time: transition.start_time,
      end_time: transition.end_time,
    })),
    nakshatra_transitions: compact.nakshatra_transitions.map((transition, idx) => ({
      name: `nakshatra-transition-${idx}`,
      nakshatra: nakshatraOrFallback(refs.nakshatraByName, transition.nakshatra),
      start_time: transition.start_time,
      end_time: transition.end_time,
    })),
    sunrise: compact.sunrise,
    sunset: compact.sunset,
    nazhika_from_sunrise: compact.nazhika_from_sunrise,
    santhigiri_significant_dates: compact.santhigiri_significant_dates.map((id) =>
      eventOrFallback(refs.eventById, id)
    ),
  }
}
