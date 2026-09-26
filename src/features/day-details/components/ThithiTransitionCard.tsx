import { MoonIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CompactTransitionRow } from "./CompactTransitionRow"
import type { Thithi, ThithiTransition } from "@/features/panchangam/schemas/panchangamData"
import { getFormattedDateTime, localizedName } from "@/lib/utils"

type ThithiTransitionCardProps = {
  transitions: Array<ThithiTransition>,
  current_thithi: Thithi,
  timeZone?: string,
  timeZoneAbbreviation?: string
}

export default function ThithiTransitionCard({ transitions, current_thithi, timeZone, timeZoneAbbreviation }: ThithiTransitionCardProps) {
  const { t, i18n } = useTranslation()
  return (
    transitions.map((transition, idx) => (
      <CompactTransitionRow
        key={`thithi-transition-${idx}`}
        icon={MoonIcon}
        label={t("dayDetails.thithiLabel")}
        value={localizedName(transition.thithi, i18n.language)}
        subLabel={localizedName(transition.thithi.paksha, i18n.language)}
        // Timezone abbreviation shown once, on the trailing end time only —
        // repeating it on both ends of the range reads as noise.
        timeRange={`${getFormattedDateTime(transition.start_time, timeZone)} - ${getFormattedDateTime(transition.end_time, timeZone, true, timeZoneAbbreviation)}`}
        isCurrent={transition.thithi.id === current_thithi.id}
      />
    ))
  )
}
