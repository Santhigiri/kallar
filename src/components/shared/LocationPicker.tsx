import { MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSelectedLocation } from "@/hooks/useSelectedLocation"
import { useLocationOptions } from "@/hooks/useLocationOptions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type LocationPickerProps = {
  showLabel: boolean
}

export default function LocationPicker({ showLabel }: LocationPickerProps) {
  const { t } = useTranslation()
  const { locationCode, setLocationCode } = useSelectedLocation()
  const { options: locationOptions } = useLocationOptions()

  // Until the reference/ip-derived options load (or if they're ever
  // unavailable), fall back to just the current selection so the control
  // never shows an empty or broken picker — no location codes are guessed here.
  const options = locationOptions.length > 0
    ? locationOptions
    : [{ code: locationCode, label: locationCode, latitude: 0, longitude: 0, timezone: "" }]

  return (
    <div className="flex flex-col gap-1.5 px-2">
      {showLabel && (
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {t("shared.location")}
        </span>
      )}
      <Select value={locationCode} onValueChange={setLocationCode}>
        <SelectTrigger className="h-auto w-full justify-start gap-2 border-none bg-transparent p-0 text-sm shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&>svg:last-child]:hidden group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <MapPin size={16} className="shrink-0 text-muted-foreground" />
          <span className={showLabel ? "truncate" : "sr-only"}>
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent position="popper">
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
