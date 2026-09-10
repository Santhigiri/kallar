import { Star } from "lucide-react"
import { CompactTransitionRow } from "./CompactTransitionRow"
import type { Nakshatra, NakshatraTransition } from "@/features/panchangam/schemas/panchangamData"
import { getFormattedDateTime } from "@/lib/utils"

export type NakshatraTransitionCardProps = {
  transitions: Array<NakshatraTransition>,
  current_nakshatra: Nakshatra,
  timeZone?: string
}

export function NakshatraTransitionCard({ transitions, current_nakshatra, timeZone }: NakshatraTransitionCardProps) {
  return (
    transitions.map((transition, idx) => (
      <CompactTransitionRow
        key={`nakshatra-transition-${idx}`}
        icon={Star}
        label="Nakshatra"
        value={transition.nakshatra.en}
        // Timezone abbreviation shown once, on the trailing end time only —
        // repeating it on both ends of the range reads as noise.
        timeRange={`${getFormattedDateTime(transition.start_time, timeZone)} - ${getFormattedDateTime(transition.end_time, timeZone, true)}`}
        isCurrent={transition.nakshatra.en === current_nakshatra.en}
      />
    ))
  )
}
