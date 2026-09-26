import { useTranslation } from "react-i18next"
import type { Thithi, ThithiTransition } from "@/features/panchangam/schemas/panchangamData"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, getFormattedDateTime, localizedName } from "@/lib/utils"

type StarfinderThithiTransitionsCardProps = {
  transitions: Array<ThithiTransition>
  currentThithi: Thithi
}

export default function StarfinderThithiTransitionsCard({
  transitions,
  currentThithi,
}: StarfinderThithiTransitionsCardProps) {
  const { t, i18n } = useTranslation()
  return (
    <Card className="rounded-xl py-4 gap-2">
      <CardHeader>
        <p className="font-semibold text-sm">{t("starfinder.thithiTransitions")}</p>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dayDetails.thithiLabel")}</TableHead>
              <TableHead>{t("starfinder.paksha")}</TableHead>
              <TableHead>{t("starfinder.start")}</TableHead>
              <TableHead>{t("starfinder.end")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transitions.map((transition, idx) => (
              <TableRow
                key={`thithi-${idx}`}
                className={cn(transition.thithi.id === currentThithi.id && "bg-primary/10")}
              >
                <TableCell className="font-medium">{localizedName(transition.thithi, i18n.language)}</TableCell>
                <TableCell className="text-muted-foreground">{localizedName(transition.thithi.paksha, i18n.language)}</TableCell>
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
