import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CompactTransitionRow } from "./CompactTransitionRow"
import type { Nakshatra, NakshatraTransition } from "@/features/panchangam/schemas/panchangamData"
import { getFormattedDateTime } from "@/lib/utils"

export type NakshatraTransitionCardProps = {
  transitions: Array<NakshatraTransition>,
  current_nakshatra: Nakshatra,
  timeZone?: string,
  timeZoneAbbreviation?: string
}

export function NakshatraTransitionCard({ transitions, current_nakshatra, timeZone, timeZoneAbbreviation }: NakshatraTransitionCardProps) {
  const { t } = useTranslation()
  return (
    transitions.map((transition, idx) => (
      <CompactTransitionRow
        key={`nakshatra-transition-${idx}`}
        icon={Star}
        label={t("dayDetails.nakshatraLabel")}
        value={transition.nakshatra.en}
        // Timezone abbreviation shown once, on the trailing end time only —
        // repeating it on both ends of the range reads as noise.
        timeRange={`${getFormattedDateTime(transition.start_time, timeZone)} - ${getFormattedDateTime(transition.end_time, timeZone, true, timeZoneAbbreviation)}`}
        isCurrent={transition.nakshatra.en === current_nakshatra.en}
      />
    ))
  )
}
