import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function UpcomingEventsCardSkeleton() {
  const { t } = useTranslation()
  return (
    <Card className="border-l-4 border-l-primary rounded-md py-3 gap-0">
      <CardHeader className="pb-2">
        <p className="font-semibold text-xs text-muted-foreground uppercase">
          {t("dayDetails.upcomingEvents.title")}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex flex-row items-center gap-3 border-b border-primary/20 py-2 last:border-b-0">
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
