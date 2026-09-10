import { useEffect, useState } from "react"
import { format, parseISO, startOfMonth } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { panchangamColumns } from "../columns"
import type { DateRange } from "react-day-picker"
import type { PanchangamGenerateStreamEvent } from "@/features/panchangam/api/panchangamGeneration"
import {
  panchangamGenerateProgress,
  panchangamGenerateResult,
} from "@/features/panchangam/schemas/compactPanchangamData"
import { ConflictError, startPanchangamGeneration } from "@/features/panchangam/api/panchangamGeneration"
import { useGenerationJobStatus } from "@/features/generation-jobs/hooks/useGenerationJobStatus"
import { useActiveGenerationJob } from "@/features/generation-jobs/hooks/useActiveGenerationJob"
import { ActiveJobBanner } from "@/features/generation-jobs/components/ActiveJobBanner"
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
import { CALENDAR_END_DATE, CALENDAR_START_DATE } from "@/lib/constants"

const LOCATION = "tvm"

// Mirrors `JOB_TYPE` in the backend's `features/panchangam/generation_router.py`.
const PANCHANGAM_JOB_TYPE = "panchangam_generate"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const YEAR_OPTIONS = Array.from(
  { length: CALENDAR_END_DATE.getFullYear() - CALENDAR_START_DATE.getFullYear() + 1 },
  (_, i) => CALENDAR_START_DATE.getFullYear() + i
)

export default function PanchangamTab() {
  const { isAuthenticated, role } = useAuth()
  const isAdmin = role === "admin"

  const [activeMonth, setActiveMonth] = useState(() => startOfMonth(new Date()))

  const { data: monthData, isLoading, isError } = usePanchangamMonth(
    activeMonth,
    LOCATION
  )

  const [range, setRange] = useState<DateRange | undefined>(() => ({
    from: startOfMonth(new Date()),
    to: new Date(),
  }))
  const [jobId, setJobId] = useState<string | null>(null)
  // Live progress pushed straight from the streamed response — updates
  // faster than the 4s job-status poll while the tab stays open. It's purely
  // a display accelerant: `jobQuery` below (backed by the DB-persisted job
  // row) is still what drives resuming after a reload or a lost connection.
  const [streamEvent, setStreamEvent] = useState<PanchangamGenerateStreamEvent | null>(null)

  // Finds a job already running — from this tab reloaded, another admin, or
  // the events tab — so its progress shows instead of a static "already
  // running" note. Only polled while we aren't already tracking our own job.
  const activeJobQuery = useActiveGenerationJob(isAdmin && jobId === null)
  const activeJob = activeJobQuery.data ?? null
  const foreignJob = activeJob && activeJob.job_type !== PANCHANGAM_JOB_TYPE ? activeJob : null
  const foreignJobRunning = foreignJob !== null

  const generateMutation = useMutation({
    mutationFn: () => {
      if (!range?.from || !range.to) {
        throw new Error("Select a date range to generate.")
      }
      return startPanchangamGeneration(range.from, range.to, LOCATION, setStreamEvent)
    },
    onSuccess: (started) => setJobId(started.job_id),
    onError: (error) => {
      if (error instanceof ConflictError) activeJobQuery.refetch()
    },
  })

  const jobQuery = useGenerationJobStatus(jobId)
  const job = jobQuery.data
  const streamProgress = streamEvent?.type === "progress" ? streamEvent : undefined
  const streamResult = streamEvent?.type === "complete" ? streamEvent : undefined
  const streamError = streamEvent?.type === "error" ? streamEvent.detail : undefined
  const progress =
    streamProgress ??
    (job?.status === "running" ? panchangamGenerateProgress.safeParse(job.progress).data : undefined)
  const result =
    streamResult ??
    (job?.status === "succeeded" ? panchangamGenerateResult.safeParse(job.result).data : undefined)

  useEffect(() => {
    if (jobId === null && activeJob?.job_type === PANCHANGAM_JOB_TYPE) {
      setJobId(activeJob.id)
    }
  }, [jobId, activeJob])

  const streamDone = streamResult !== undefined || streamError !== undefined
  const isGenerating =
    !streamDone && (generateMutation.isPending || job?.status === "running" || foreignJobRunning)

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
          <CardTitle>Generate</CardTitle>
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
                    : "Select date range"}
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
              disabled={!isAdmin || isGenerating || !range?.from || !range.to}
              onClick={() => {
                setJobId(null)
                setStreamEvent(null)
                generateMutation.mutate()
              }}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
            {!isAuthenticated && (
              <span className="text-sm text-muted-foreground">
                Log in as an admin to generate data.
              </span>
            )}
            {isAuthenticated && !isAdmin && (
              <span className="text-sm text-muted-foreground">
                Only admins can generate data.
              </span>
            )}
          </div>

          {foreignJob && <ActiveJobBanner job={foreignJob} />}
          {!foreignJobRunning && isGenerating && (
            <div className="flex flex-col gap-1">
              {progress ? (
                <>
                  <Progress value={progress.percent} />
                  <span className="text-sm text-muted-foreground">
                    {progress.completed}/{progress.total} days ({format(parseISO(progress.current_date), "d MMM")})
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Generating…</span>
              )}
            </div>
          )}
          {result && (
            <p className="text-sm text-foreground">
              Generated {result.count} day(s) from {result.start_date} to {result.end_date}.
            </p>
          )}
          {generateMutation.isError && !foreignJobRunning && (
            <p className="text-sm text-destructive">
              {generateMutation.error instanceof Error
                ? generateMutation.error.message
                : "Failed to generate panchangam data."}
            </p>
          )}
          {(streamError !== undefined || job?.status === "failed") && (
            <p className="text-sm text-destructive">
              {streamError ?? job?.error ?? "Failed to generate panchangam data."}
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
              <SelectTrigger aria-label="Month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, index) => (
                  <SelectItem key={name} value={String(index)}>
                    {name}
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
              <SelectTrigger aria-label="Year">
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
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              This month hasn't been generated yet.
            </p>
          )}
          {!isLoading && !isError && rows.length > 0 && (
            <DataTable columns={panchangamColumns} data={rows} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
