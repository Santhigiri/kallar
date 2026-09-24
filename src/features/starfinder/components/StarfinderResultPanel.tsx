import { differenceInMinutes, parseISO } from "date-fns"
import { MoonIcon, Star, SunriseIcon, SunsetIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { KollavarshamDate, Nakshatra, Thithi } from "@/features/panchangam/schemas/panchangamData"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getFormattedTime } from "@/lib/utils"
import { dateToKey, zonedTimeToUtc } from "@/lib/date"

type StarfinderResultPanelProps = {
  queriedDate: Date
  timeOfDay: string
  kv: KollavarshamDate
  nakshatra: Nakshatra
  thithi: Thithi
  sunrise: string
  sunset: string
  timeZone: string
}

export default function StarfinderResultPanel({
  queriedDate,
  timeOfDay,
  kv,
  nakshatra,
  thithi,
  sunrise,
  sunset,
  timeZone,
}: StarfinderResultPanelProps) {
  const { t, i18n } = useTranslation()
  const sunriseDate = parseISO(sunrise)
  const sunsetDate = parseISO(sunset)
  const queriedInstant = zonedTimeToUtc(dateToKey(queriedDate), timeOfDay, timeZone)

  const totalMinutes = differenceInMinutes(sunsetDate, sunriseDate)
  const daylightMinutes = ((totalMinutes % 1440) + 1440) % 1440
  const daylightHours = Math.floor(daylightMinutes / 60)
  const daylightRemainderMinutes = daylightMinutes % 60

  const elapsedMinutes = differenceInMinutes(queriedInstant, sunriseDate)
  const progress = daylightMinutes > 0
    ? Math.min(1, Math.max(0, elapsedMinutes / daylightMinutes))
    : 0

  return (
    <Card className="rounded-xl py-5">
      <CardContent className="flex flex-col gap-4 px-5">
        <div className="flex flex-col items-center gap-0.5 text-center">
          <p className="font-playfair-display text-2xl font-semibold">
            {queriedDate.toLocaleDateString(i18n.language, { weekday: "long" })}
          </p>
          <p className="font-inter text-sm font-medium text-muted-foreground">
            {queriedDate.toLocaleDateString(i18n.language, { month: "long", day: "numeric", year: "numeric" })}
            {" · "}
            {timeOfDay}
          </p>
          <p className="font-inter text-sm font-medium text-muted-foreground">
            {kv.kv_month_name_en} {kv.kv_day}, {kv.kv_year}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted px-3 py-4 text-center">
            <Star className="h-5 w-5 text-primary" />
            <p className="font-inter text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {t("dayDetails.nakshatraLabel")}
            </p>
            <p className="font-playfair-display text-lg font-semibold">{nakshatra.en}</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted px-3 py-4 text-center">
            <MoonIcon className="h-5 w-5 text-primary" />
            <p className="font-inter text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {t("dayDetails.thithiLabel")}
            </p>
            <p className="font-playfair-display text-lg font-semibold">{thithi.en}</p>
            <p className="font-inter text-xs text-muted-foreground">{thithi.paksha.en}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg bg-muted px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SunriseIcon className="h-4 w-4 text-primary" />
              <span className="font-inter text-sm">{getFormattedTime(sunrise, timeZone)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-inter text-sm">{getFormattedTime(sunset, timeZone)}</span>
              <SunsetIcon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <Progress value={progress * 100} className="h-1.5" />
          <p className="text-center font-inter text-xs text-muted-foreground">
            {t("dayDetails.daylight", { hours: daylightHours, minutes: daylightRemainderMinutes })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
