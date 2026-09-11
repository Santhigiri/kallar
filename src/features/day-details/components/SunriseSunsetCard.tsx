import {
  differenceInMinutes,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
} from "date-fns"
import { SunriseIcon, SunsetIcon } from "lucide-react"
import type { ISODatetime } from "@/features/panchangam/schemas/panchangamData"
import type { ReactNode } from "react"
import { getFormattedTime } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type SunriseSunsetProps = {
  sunrise: ISODatetime,
  sunset: ISODatetime,
  timeZone?: string,
  nazhika?: number,
}

export default function SunriseSunsetCard({ sunrise, sunset, timeZone, nazhika }: SunriseSunsetProps): ReactNode {
  const sunriseDate = parseISO(sunrise)
  const sunsetDate = parseISO(sunset)
  const now = new Date()

  const today = isToday(sunriseDate)
  const past = !today && isBefore(startOfDay(sunriseDate), startOfDay(now))

  const totalMinutes = differenceInMinutes(sunsetDate, sunriseDate)
  // Normalize to a same-day span: sunrise/sunset instants can come back
  // ordered such that the raw difference is negative (e.g. a day-boundary
  // edge case in the source data), which should read as "wrapped past
  // midnight" rather than a negative daylight duration.
  const daylightMinutes = ((totalMinutes % 1440) + 1440) % 1440
  const daylightHours = Math.floor(daylightMinutes / 60)
  const daylightRemainderMinutes = daylightMinutes % 60

  const elapsedMinutes = differenceInMinutes(now, sunriseDate)
  const progress = daylightMinutes > 0
    ? Math.min(1, Math.max(0, elapsedMinutes / daylightMinutes))
    : 0

  // Future days: bar not yet started. Past days: bar fully complete.
  // Today: reflects live elapsed/total-daylight-minutes progress.
  const fillPercent = today ? progress * 100 : past ? 100 : 0

  return (
    <Card className="rounded-md py-4">
      <CardContent className="flex flex-col items-center gap-3 px-4">
        <div className="flex w-full items-end justify-between gap-2">
          <div className="flex flex-col items-start gap-0.5">
            <SunriseIcon className="h-5 w-5 text-primary" />
            <p className="font-inter text-muted-foreground text-[12px] font-semibold">SUNRISE</p>
            <p className="font-inter text-sm font-medium">{getFormattedTime(sunrise, timeZone)}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <SunsetIcon className="h-5 w-5 text-primary" />
            <p className="font-inter text-muted-foreground text-[12px] font-semibold">SUNSET</p>
            <p className="font-inter text-sm font-medium">{getFormattedTime(sunset, timeZone)}</p>
          </div>
        </div>

        <div className="relative h-2 w-full" aria-hidden="true">
          <div className="absolute inset-0 rounded-full bg-border" />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${fillPercent}%` }}
          />
          {today && (
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm"
              style={{ left: `${fillPercent}%` }}
            />
          )}
        </div>

        <p className="font-inter text-xs text-muted-foreground">
          daylight · {daylightHours}h {daylightRemainderMinutes}m
        </p>

        {nazhika !== undefined && (
          <div className="flex w-full items-baseline justify-between gap-3 border-t border-border pt-3">
            <span className="font-inter text-xs text-muted-foreground">Nazhika from sunrise</span>
            <span className="font-inter text-base font-semibold">{nazhika.toFixed(1)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
