import { useState } from "react"
import { format, parseISO, startOfMonth } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { buildPanchangamColumns } from "../columns"
import type { DateRange } from "react-day-picker"
import type { PanchangamGenerateProgress } from "@/features/panchangam/schemas/compactPanchangamData"
import { generatePanchangam } from "@/features/panchangam/api/panchangamGeneration"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { usePanchangamMonth } from "@/features/data-admin/hooks/usePanchangamMonth"
import { isAtLeast } from "@/lib/auth/roles"
import { CALENDAR_END_DATE, CALENDAR_START_DATE } from "@/lib/constants"

const LOCATION = "tvm"

const YEAR_OPTIONS = Array.from(
  { length: CALENDAR_END_DATE.getFullYear() - CALENDAR_START_DATE.getFullYear() + 1 },
  (_, i) => CALENDAR_START_DATE.getFullYear() + i
)

export default function PanchangamTab() {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, role } = useAuth()
  const isAdmin = isAtLeast(role, "ADMIN")

  const [activeMonth, setActiveMonth] = useState(() => startOfMonth(new Date()))

  const { data: monthData, isLoading, isError } = usePanchangamMonth(
    activeMonth,
    LOCATION
  )

  const [progress, setProgress] = useState<PanchangamGenerateProgress | null>(null)
  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: new Date(),
  }))

  const generateMutation = useMutation({
    mutationFn: () => {
      if (!range?.from || !range.to) {
        throw new Error(t("dataAdmin.panchangamTab.rangeRequired"))
      }
      setProgress(null)
      return generatePanchangam(range.from, range.to, LOCATION, setProgress)
    },
  })

  // The backend's monthly endpoint can include a few days that spill outside
  // the requested Gregorian month (e.g. Malayalam-calendar boundary days) —
  // keep only rows whose date actually falls within the selected month.
  const activeMonthPrefix = format(activeMonth, "yyyy-MM")
  const rows = monthData
    ? Object.values(monthData)
        .filter((day) => day.date.startsWith(activeMonthPrefix))
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("dataAdmin.panchangamTab.generateTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start font-normal">
                  <CalendarIcon />
                  {range?.from
                    ? range.to
                      ? `${format(range.from, "d MMM yyyy")} – ${format(range.to, "d MMM yyyy")}`
                      : format(range.from, "d MMM yyyy")
                    : t("dataAdmin.panchangamTab.selectDateRange")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  captionLayout="dropdown"
                  selected={range}
                  onSelect={setRange}
                  startMonth={CALENDAR_START_DATE}
                  endMonth={CALENDAR_END_DATE}
                  disabled={{ before: CALENDAR_START_DATE, after: CALENDAR_END_DATE }}
                />
              </PopoverContent>
            </Popover>
            <Button
              disabled={!isAdmin || generateMutation.isPending || !range?.from || !range.to}
              onClick={() => generateMutation.mutate()}
            >
              {generateMutation.isPending ? t("common.generating") : t("common.generate")}
            </Button>
            {!isAuthenticated && (
              <span className="text-sm text-muted-foreground">
                {t("dataAdmin.panchangamTab.loginAsAdmin")}
              </span>
            )}
            {isAuthenticated && !isAdmin && (
              <span className="text-sm text-muted-foreground">
                {t("dataAdmin.panchangamTab.onlyAdmins")}
              </span>
            )}
          </div>

          {generateMutation.isPending && progress && (
            <div className="flex flex-col gap-1">
              <Progress value={progress.percent} />
              <span className="text-sm text-muted-foreground">
                {t("dataAdmin.panchangamTab.progress", {
                  completed: progress.completed,
                  total: progress.total,
                  date: format(parseISO(progress.current_date), "d MMM"),
                })}
              </span>
            </div>
          )}
          {generateMutation.isSuccess && (
            <p className="text-sm text-foreground">
              {t("dataAdmin.panchangamTab.generatedSuccess", {
                count: generateMutation.data.count,
                start: generateMutation.data.start_date,
                end: generateMutation.data.end_date,
              })}
            </p>
          )}
          {generateMutation.isError && (
            <p className="text-sm text-destructive">
              {generateMutation.error instanceof Error
                ? generateMutation.error.message
                : t("dataAdmin.panchangamTab.generateFailed")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{format(activeMonth, "MMMM yyyy")}</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Select
              value={String(activeMonth.getMonth())}
              onValueChange={(value) =>
                setActiveMonth((m) => startOfMonth(new Date(m.getFullYear(), Number(value), 1)))
              }
            >
              <SelectTrigger aria-label={t("calendar.monthAriaLabel")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem key={index} value={String(index)}>
                    {new Date(2000, index, 1).toLocaleDateString(i18n.language, { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(activeMonth.getFullYear())}
              onValueChange={(value) =>
                setActiveMonth((m) => startOfMonth(new Date(Number(value), m.getMonth(), 1)))
              }
            >
              <SelectTrigger aria-label={t("calendar.yearAriaLabel")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              {t("dataAdmin.panchangamTab.notGenerated")}
            </p>
          )}
          {!isLoading && !isError && rows.length > 0 && (
            <DataTable columns={buildPanchangamColumns(t)} data={rows} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
