import { format } from "date-fns"
import { InfoIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { UpcomingEvent } from "@/features/day-details/hooks/useHomePanchangam"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export type UpcomingEventsCardProps = {
  events: Array<UpcomingEvent>
}

export default function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  const { t } = useTranslation()
  return (
    <Card className="border-l-4 border-l-primary rounded-md py-3 gap-0">
      <CardHeader className="pb-2">
        <p className="font-semibold text-xs text-muted-foreground uppercase">
          {t("dayDetails.upcomingEvents.title")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {events.length === 0 && (
          <p className="text-xs text-muted-foreground font-inter">
            {t("dayDetails.upcomingEvents.empty")}
          </p>
        )}
        {events.map(({ date, event }, idx) => (
          <div
            key={idx}
            className="flex flex-row items-center gap-3 border-b border-primary/20 py-2 last:border-b-0 text-primary font-semibold font-inter text-xs md:text-sm"
          >
            <p className="shrink-0">{format(date, "MMM d")}</p>
            <p className="truncate">{event.name}</p>
            <HoverCard openDelay={150} closeDelay={50}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label={t("dayDetails.upcomingEvents.detailsAriaLabel", { name: event.name })}
                  className="ml-auto shrink-0 text-primary/70 hover:text-primary"
                >
                  <InfoIcon className="h-4 w-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <p className="font-playfair-display font-bold text-primary">{event.name}</p>
                <p className="mt-1 font-inter text-xs font-normal text-muted-foreground md:text-sm">
                  {event.description}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
