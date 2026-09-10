import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import type {
  SanthigiriEvent,
  SanthigiriEventGenerateProgress,
} from "@/features/santhigiri-events/schemas/santhigiriEvent"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGenerateSanthigiriEventOccurrences } from "@/features/santhigiri-events/hooks/useSanthigiriEventMutations"
import { CALENDAR_END_DATE, CALENDAR_START_DATE } from "@/lib/constants"

const YEAR_OPTIONS = Array.from(
  { length: CALENDAR_END_DATE.getFullYear() - CALENDAR_START_DATE.getFullYear() + 1 },
  (_, i) => CALENDAR_START_DATE.getFullYear() + i
)

const MAX_YEAR_SPAN = 15

type GenerateOccurrencesDialogProps = {
  event: SanthigiriEvent | null
  onOpenChange: (open: boolean) => void
}

export function GenerateOccurrencesDialog({
  event,
  onOpenChange,
}: GenerateOccurrencesDialogProps) {
  const [startYear, setStartYear] = useState(() => new Date().getFullYear())
  const [endYear, setEndYear] = useState(() => new Date().getFullYear())
  const [progress, setProgress] = useState<SanthigiriEventGenerateProgress | null>(null)
  const generateMutation = useGenerateSanthigiriEventOccurrences(setProgress)

  const { reset: resetGenerateMutation } = generateMutation
  useEffect(() => {
    if (event) {
      const currentYear = new Date().getFullYear()
      setStartYear(currentYear)
      setEndYear(currentYear)
      setProgress(null)
      resetGenerateMutation()
    }
  }, [event, resetGenerateMutation])

  const rangeInvalid = endYear < startYear
  const rangeTooLarge = !rangeInvalid && endYear - startYear + 1 > MAX_YEAR_SPAN

  const handleCopyDates = () => {
    if (!generateMutation.data) return
    const text = Object.entries(generateMutation.data.occurrences)
      .flatMap(([, dates]) => dates)
      .sort()
      .map((date) => format(parseISO(date), "d MMMM yyyy"))
      .join("\n")
    navigator.clipboard.writeText(text)
    toast.success("Occurrence dates copied to clipboard")
  }

  return (
    <Dialog open={event !== null} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate occurrences</DialogTitle>
          <DialogDescription>
            Recompute {event?.name}&rsquo;s occurrence dates for a range of years from the
            stored panchangam data. This replaces any dates already generated for those years.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          <Field className="flex-1">
            <FieldLabel htmlFor="occurrences-start-year">Start year</FieldLabel>
            <Select
              value={String(startYear)}
              onValueChange={(value) => setStartYear(Number(value))}
            >
              <SelectTrigger id="occurrences-start-year" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field className="flex-1">
            <FieldLabel htmlFor="occurrences-end-year">End year</FieldLabel>
            <Select value={String(endYear)} onValueChange={(value) => setEndYear(Number(value))}>
              <SelectTrigger id="occurrences-end-year" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {rangeInvalid && (
          <FieldError>End year must be on or after start year.</FieldError>
        )}
        {rangeTooLarge && (
          <FieldError>Year range too large (max {MAX_YEAR_SPAN} years).</FieldError>
        )}

        {generateMutation.isPending && progress && (
          <div className="flex flex-col gap-1">
            <Progress value={progress.percent} />
            <span className="text-sm text-muted-foreground">
              {progress.completed}/{progress.total} years ({progress.year})
            </span>
          </div>
        )}

        {generateMutation.isSuccess && (
          <div className="max-h-64 overflow-y-auto text-sm text-foreground">
            {Object.entries(generateMutation.data.occurrences).map(([year, dates]) => (
              <div key={year} className="mb-2">
                <p className="mb-1 font-medium">
                  {year}: {dates.length === 0 ? "no occurrences" : `${dates.length} occurrence(s)`}
                </p>
                {dates.length > 0 && (
                  <ul className="list-inside list-disc text-muted-foreground">
                    {dates.map((date) => (
                      <li key={date}>{format(parseISO(date), "d MMMM yyyy")}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {generateMutation.isError && (
          <FieldError>
            {generateMutation.error instanceof Error
              ? generateMutation.error.message
              : "Failed to generate occurrences."}
          </FieldError>
        )}

        <DialogFooter>
          {generateMutation.isSuccess ? (
            <>
              <Button variant="outline" onClick={handleCopyDates}>
                <Copy />
                Copy dates
              </Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </>
          ) : (
            <Button
              disabled={!event || generateMutation.isPending || rangeInvalid || rangeTooLarge}
              onClick={() => {
                if (event) {
                  setProgress(null)
                  generateMutation.mutate({ eventId: event.id, startYear, endYear })
                }
              }}
            >
              {generateMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
