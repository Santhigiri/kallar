import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import type { SanthigiriEventDetail, SanthigiriEventFormValues } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useChandraMasaReference,
  useMasaReference,
  useNakshatraReference,
  useSanthigiriEvents,
  useThithiReference,
} from "@/features/panchangam/hooks/usePanchangamReference"

const NONE = "none"

function NullableReferenceSelect({
  id,
  value,
  onChange,
  isLoading,
  options,
  showNoneOption = true,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  isLoading: boolean
  options: Array<{ id: number | string; label: string }>
  showNoneOption?: boolean
}) {
  return (
    <Select
      value={value === "" ? NONE : value}
      onValueChange={(next) => onChange(next === NONE ? "" : next)}
    >
      <SelectTrigger id={id} className="w-full" disabled={isLoading}>
        <SelectValue placeholder={isLoading ? "Loading..." : "None"} />
      </SelectTrigger>
      <SelectContent>
        {showNoneOption && <SelectItem value={NONE}>None</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type FormState = {
  id: string
  name: string
  description: string
  sort_order: string
  nakshatra_id: string
  thithi_id: string
  ml_day: string
  ml_month: string
  ml_year: string
  chandra_masa_day: string
  chandra_masa_month: string
  en_day: string
  en_month: string
  en_year: string
  occurance: string
  is_poornima: boolean | null
  last_occurance: boolean | null
  yields_to_event_id: string
}

/**
 * is_poornima/last_occurance are tri-state on the wire (null = not a
 * criterion, true/false = an explicit constraint) — cycle null -> true ->
 * false -> null so the UI can produce and preserve all three instead of
 * collapsing an unset value to false.
 */
function cycleTriState(current: boolean | null): boolean | null {
  if (current === null) return true
  if (current === true) return false
  return null
}

function triStateLabel(value: boolean | null): string {
  if (value === null) return "Not a criterion"
  return value ? "Must match" : "Must not match"
}

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  description: "",
  sort_order: "",
  nakshatra_id: "",
  thithi_id: "",
  ml_day: "",
  ml_month: "",
  ml_year: "",
  chandra_masa_day: "",
  chandra_masa_month: "",
  en_day: "",
  en_month: "",
  en_year: "",
  occurance: "",
  is_poornima: null,
  last_occurance: null,
  yields_to_event_id: "",
}

function toFormState(event: SanthigiriEventDetail): FormState {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    sort_order: event.sort_order?.toString() ?? "",
    nakshatra_id: event.nakshatra_id?.toString() ?? "",
    thithi_id: event.thithi_id?.toString() ?? "",
    ml_day: event.ml_day?.toString() ?? "",
    ml_month: event.ml_month?.toString() ?? "",
    ml_year: event.ml_year?.toString() ?? "",
    chandra_masa_day: event.chandra_masa_day?.toString() ?? "",
    chandra_masa_month: event.chandra_masa_month?.toString() ?? "",
    en_day: event.en_day?.toString() ?? "",
    en_month: event.en_month?.toString() ?? "",
    en_year: event.en_year?.toString() ?? "",
    occurance: event.occurance?.toString() ?? "",
    is_poornima: event.is_poornima ?? null,
    last_occurance: event.last_occurance ?? null,
    yields_to_event_id: event.yields_to_event_id ?? "",
  }
}

function toEventId(name: string): string {
  return name
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function toFormValues(form: FormState): SanthigiriEventFormValues {
  return {
    id: form.id.trim(),
    name: form.name.trim(),
    description: form.description,
    sort_order: toNullableInt(form.sort_order),
    nakshatra_id: toNullableInt(form.nakshatra_id),
    thithi_id: toNullableInt(form.thithi_id),
    ml_day: toNullableInt(form.ml_day),
    ml_month: toNullableInt(form.ml_month),
    ml_year: toNullableInt(form.ml_year),
    chandra_masa_day: toNullableInt(form.chandra_masa_day),
    chandra_masa_month: toNullableInt(form.chandra_masa_month),
    en_day: toNullableInt(form.en_day),
    en_month: toNullableInt(form.en_month),
    en_year: toNullableInt(form.en_year),
    occurance: toNullableInt(form.occurance),
    is_poornima: form.is_poornima,
    last_occurance: form.last_occurance,
    yields_to_event_id: form.yields_to_event_id.trim() === "" ? null : form.yields_to_event_id,
  }
}

type EventFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: SanthigiriEventDetail
  onSubmit: (values: SanthigiriEventFormValues) => Promise<unknown>
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  onSubmit,
}: EventFormDialogProps) {
  const isEdit = event !== undefined
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nakshatraReference = useNakshatraReference()
  const thithiReference = useThithiReference()
  const masaReference = useMasaReference()
  const chandraMasaReference = useChandraMasaReference()
  const santhigiriEvents = useSanthigiriEvents()

  useEffect(() => {
    if (open) {
      setForm(event ? toFormState(event) : EMPTY_FORM)
      setError(null)
      setIsSubmitting(false)
    }
  }, [open, event])

  function set<TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      id: isEdit ? f.id : toEventId(value),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.id.trim() === "") {
      setError("Name must contain at least one letter or number to generate an event ID.")
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit(toFormValues(form))
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the definition for ${event.id}.`
              : "Define a new Santhigiri event and its matching condition."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="event-name">Name</FieldLabel>
              <Input
                id="event-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-id">Event ID</FieldLabel>
              <Input
                id="event-id"
                value={form.id}
                disabled
                placeholder="Generated from the name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-description">Description</FieldLabel>
              <Textarea
                id="event-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-sort-order">Sort order</FieldLabel>
              <Input
                id="event-sort-order"
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="event-nakshatra">Nakshatra</FieldLabel>
                <NullableReferenceSelect
                  id="event-nakshatra"
                  value={form.nakshatra_id}
                  onChange={(value) => set("nakshatra_id", value)}
                  isLoading={nakshatraReference.isLoading}
                  options={(nakshatraReference.data ?? []).map((n) => ({
                    id: n.id,
                    label: `${n.en} (${n.ml})`,
                  }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="event-thithi">Thithi</FieldLabel>
                <NullableReferenceSelect
                  id="event-thithi"
                  value={form.thithi_id}
                  onChange={(value) => set("thithi_id", value)}
                  isLoading={thithiReference.isLoading}
                  options={(thithiReference.data ?? []).map((t) => ({
                    id: t.id,
                    label: `${t.en} — ${t.paksha.en}`,
                  }))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="event-ml-day">Malayalam day</FieldLabel>
                <Input
                  id="event-ml-day"
                  type="number"
                  value={form.ml_day}
                  onChange={(e) => set("ml_day", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="event-ml-month">Malayalam masa</FieldLabel>
                <NullableReferenceSelect
                  id="event-ml-month"
                  value={form.ml_month}
                  onChange={(value) => set("ml_month", value)}
                  isLoading={masaReference.isLoading}
                  options={(masaReference.data ?? []).map((m) => ({
                    id: m.id,
                    label: `${m.en} (${m.ml})`,
                  }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="event-ml-year">Malayalam year</FieldLabel>
                <Input
                  id="event-ml-year"
                  type="number"
                  value={form.ml_year}
                  onChange={(e) => set("ml_year", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="event-chandra-masa-day">Lunar day</FieldLabel>
                <Input
                  id="event-chandra-masa-day"
                  type="number"
                  value={form.chandra_masa_day}
                  onChange={(e) => set("chandra_masa_day", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="event-chandra-masa-month">Lunar month</FieldLabel>
                <NullableReferenceSelect
                  id="event-chandra-masa-month"
                  value={form.chandra_masa_month}
                  onChange={(value) => set("chandra_masa_month", value)}
                  isLoading={chandraMasaReference.isLoading}
                  showNoneOption={false}
                  options={(chandraMasaReference.data ?? []).map((m) => ({
                    id: m.id,
                    label: `${m.en} (${m.ml})`,
                  }))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="event-en-day">English day</FieldLabel>
                <Input
                  id="event-en-day"
                  type="number"
                  value={form.en_day}
                  onChange={(e) => set("en_day", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="event-en-month">English month</FieldLabel>
                <Input
                  id="event-en-month"
                  type="number"
                  value={form.en_month}
                  onChange={(e) => set("en_month", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="event-en-year">English year</FieldLabel>
                <Input
                  id="event-en-year"
                  type="number"
                  value={form.en_year}
                  onChange={(e) => set("en_year", e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="event-occurance">Occurrence</FieldLabel>
              <Input
                id="event-occurance"
                type="number"
                value={form.occurance}
                onChange={(e) => set("occurance", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event-yields-to">Yields to</FieldLabel>
              <NullableReferenceSelect
                id="event-yields-to"
                value={form.yields_to_event_id}
                onChange={(value) => set("yields_to_event_id", value)}
                isLoading={santhigiriEvents.isLoading}
                options={(santhigiriEvents.data ?? [])
                  .filter((e) => e.id !== form.id)
                  .map((e) => ({ id: e.id, label: e.name }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event-is-poornima" className="flex-row items-center gap-2">
                <Checkbox
                  id="event-is-poornima"
                  checked={form.is_poornima === null ? "indeterminate" : form.is_poornima}
                  onCheckedChange={() => set("is_poornima", cycleTriState(form.is_poornima))}
                />
                Is Poornima
                <span className="text-muted-foreground text-xs">
                  ({triStateLabel(form.is_poornima)})
                </span>
              </FieldLabel>
            </Field>
            <Field>
              <FieldLabel htmlFor="event-last-occurance" className="flex-row items-center gap-2">
                <Checkbox
                  id="event-last-occurance"
                  checked={form.last_occurance === null ? "indeterminate" : form.last_occurance}
                  onCheckedChange={() => set("last_occurance", cycleTriState(form.last_occurance))}
                />
                Last occurrence
                <span className="text-muted-foreground text-xs">
                  ({triStateLabel(form.last_occurance)})
                </span>
              </FieldLabel>
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create event"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
