import type { KollavarshamDate, Nakshatra, NakshatraTransition, Thithi, ThithiTransition } from "@/features/panchangam/schemas/panchangamData"
import { getFormattedTime } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type MalayalamDateCardProps = {
  thithi: Thithi
  thithiTransitions: Array<ThithiTransition>
  nakshatra: Nakshatra
  nakshatraTransitions: Array<NakshatraTransition>
  kv: KollavarshamDate
}

// The transition list is chronological, so the first entry matching the
// current thithi/nakshatra name is the one currently in effect — its
// end_time is when it hands off to the next one ("until h:mm a").
function currentWindowEnd<T extends { end_time: string | null }>(
  transitions: Array<T & { name: string }>,
  currentName: string
): string | null {
  return transitions.find((t) => t.name === currentName)?.end_time ?? null
}

export default function MalayalamDateCard({
  thithi,
  thithiTransitions,
  nakshatra,
  nakshatraTransitions,
  kv,
}: MalayalamDateCardProps) {
  const thithiEnd = currentWindowEnd(
    thithiTransitions.map((t) => ({ ...t, name: t.thithi.en })),
    thithi.en
  )
  const nakshatraEnd = currentWindowEnd(
    nakshatraTransitions.map((t) => ({ ...t, name: t.nakshatra.en })),
    nakshatra.en
  )

  return (
    <Card className="gap-4 rounded-md bg-accent-100 py-6">
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-wide text-accent-700 uppercase">Malayalam date</p>
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] tracking-wide text-accent-700 uppercase">Thithi</p>
            <p className="mt-1 truncate font-playfair-display text-3xl leading-tight">{thithi.en}</p>
            {thithiEnd && (
              <p className="mt-1.5 text-xs text-accent-700">until {getFormattedTime(thithiEnd)}</p>
            )}
          </div>
          <div className="w-px shrink-0 bg-border" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] tracking-wide text-accent-700 uppercase">Nakshatra</p>
            <p className="mt-1 truncate font-playfair-display text-3xl leading-tight">{nakshatra.en}</p>
            {nakshatraEnd && (
              <p className="mt-1.5 text-xs text-accent-700">until {getFormattedTime(nakshatraEnd)}</p>
            )}
          </div>
        </div>
        <div className="border-t border-border pt-3 text-sm text-accent-900">
          Kollavarsham {kv.kv_day} {kv.kv_month_name_en} {kv.kv_year}
        </div>
      </CardContent>
    </Card>
  )
}
