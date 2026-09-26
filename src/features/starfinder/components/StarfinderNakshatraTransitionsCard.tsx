import { useTranslation } from "react-i18next"
import type { Nakshatra, NakshatraTransition } from "@/features/panchangam/schemas/panchangamData"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, getFormattedDateTime, localizedName } from "@/lib/utils"

type StarfinderNakshatraTransitionsCardProps = {
  transitions: Array<NakshatraTransition>
  currentNakshatra: Nakshatra
}

export default function StarfinderNakshatraTransitionsCard({
  transitions,
  currentNakshatra,
}: StarfinderNakshatraTransitionsCardProps) {
  const { t, i18n } = useTranslation()
  return (
    <Card className="rounded-xl py-4 gap-2 mb-2">
      <CardHeader>
        <p className="font-semibold text-sm">{t("starfinder.nakshatraTransitions")}</p>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dayDetails.nakshatraLabel")}</TableHead>
              <TableHead>{t("starfinder.start")}</TableHead>
              <TableHead>{t("starfinder.end")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transitions.map((transition, idx) => (
              <TableRow
                key={`nakshatra-${idx}`}
                className={cn(transition.nakshatra.id === currentNakshatra.id && "bg-primary/10")}
              >
                <TableCell className="font-medium">{localizedName(transition.nakshatra, i18n.language)}</TableCell>
                <TableCell className="text-muted-foreground">{getFormattedDateTime(transition.start_time)}</TableCell>
                <TableCell className="text-muted-foreground">{getFormattedDateTime(transition.end_time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
