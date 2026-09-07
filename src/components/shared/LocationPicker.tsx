import { MapPin } from "lucide-react"
import { useLocationsReference } from "@/features/panchangam/hooks/usePanchangamReference"
import { useSelectedLocation } from "@/hooks/useSelectedLocation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type LocationPickerProps = {
  showLabel: boolean
}

export default function LocationPicker({ showLabel }: LocationPickerProps) {
  const { locationCode, setLocationCode } = useSelectedLocation()
  const { data: locations } = useLocationsReference()

  // Until the reference list loads (or if it's ever unavailable), fall back
  // to just the current selection so the control never shows an empty or
  // broken picker — no location codes are guessed here.
  const options = locations && locations.length > 0
    ? locations
    : [{ code: locationCode, label: locationCode }]

  return (
    <div className="flex flex-col gap-1.5 px-2">
      {showLabel && (
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Location
        </span>
      )}
      <Select value={locationCode} onValueChange={setLocationCode}>
        <SelectTrigger className="h-auto w-full justify-start gap-2 border-none bg-transparent p-0 text-sm shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&>svg]:hidden">
          <MapPin size={16} className="shrink-0 text-muted-foreground" />
          {showLabel && (
            <span className="truncate">
              <SelectValue />
            </span>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((location) => (
            <SelectItem key={location.code} value={location.code}>
              {location.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
