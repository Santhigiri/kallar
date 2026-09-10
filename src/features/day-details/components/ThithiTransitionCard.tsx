import { MoonIcon } from "lucide-react"
import { CompactTransitionRow } from "./CompactTransitionRow"
import type { Thithi, ThithiTransition } from "@/features/panchangam/schemas/panchangamData"
import { getFormattedDateTime } from "@/lib/utils"

type ThithiTransitionCardProps = {
  transitions: Array<ThithiTransition>,
  current_thithi: Thithi,
  timeZone?: string
}

export default function ThithiTransitionCard({ transitions, current_thithi, timeZone }: ThithiTransitionCardProps) {
  return (
    transitions.map((transition, idx) => (
      <CompactTransitionRow
        key={`thithi-transition-${idx}`}
        icon={MoonIcon}
        label="Thithi"
        value={transition.thithi.en}
        subLabel={transition.thithi.paksha.en}
        // Timezone abbreviation shown once, on the trailing end time only —
        // repeating it on both ends of the range reads as noise.
        timeRange={`${getFormattedDateTime(transition.start_time, timeZone)} - ${getFormattedDateTime(transition.end_time, timeZone, true)}`}
        isCurrent={transition.thithi.en === current_thithi.en}
      />
    ))
  )
}
