import { Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CompactTransitionRow } from "./CompactTransitionRow"
import type { Nakshatra, NakshatraTransition } from "@/features/panchangam/schemas/panchangamData"
import { getFormattedDateTime, localizedName } from "@/lib/utils"

export type NakshatraTransitionCardProps = {
  transitions: Array<NakshatraTransition>,
  current_nakshatra: Nakshatra,
  timeZone?: string,
  timeZoneAbbreviation?: string
}

export function NakshatraTransitionCard({ transitions, current_nakshatra, timeZone, timeZoneAbbreviation }: NakshatraTransitionCardProps) {
  const { t, i18n } = useTranslation()
  return (
    transitions.map((transition, idx) => (
      <CompactTransitionRow
        key={`nakshatra-transition-${idx}`}
        icon={Star}
        label={t("dayDetails.nakshatraLabel")}
        value={localizedName(transition.nakshatra, i18n.language)}
        // Timezone abbreviation shown once, on the trailing end time only —
        // repeating it on both ends of the range reads as noise.
        timeRange={`${getFormattedDateTime(transition.start_time, timeZone)} - ${getFormattedDateTime(transition.end_time, timeZone, true, timeZoneAbbreviation)}`}
        isCurrent={transition.nakshatra.id === current_nakshatra.id}
      />
    ))
  )
}
