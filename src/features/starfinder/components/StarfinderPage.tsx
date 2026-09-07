import { useState } from "react"
import { CalendarIcon, MapPinIcon, Telescope } from "lucide-react"
import StarfinderResultPanel from "./StarfinderResultPanel"
import StarfinderResultPanelSkeleton from "./StarfinderResultPanelSkeleton"
import StarfinderThithiTransitionsCard from "./StarfinderThithiTransitionsCard"
import StarfinderNakshatraTransitionsCard from "./StarfinderNakshatraTransitionsCard"
import StarfinderTransitionsCardsSkeleton from "./StarfinderTransitionsCardsSkeleton"
import type { FormEvent } from "react"
import type { LocationSearchResult } from "@/features/starfinder/schemas/locationSearchResult"
import type { StarfinderParams } from "@/features/starfinder/hooks/useStarfinder"
import TopAppBar from "@/components/shared/TopAppBar"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocationSearch } from "@/features/starfinder/hooks/useLocationSearch"
import { useReferenceMaps } from "@/features/panchangam/hooks/useReferenceMaps"
import { Button } from "@/components/ui/button"
import { useStarfinder } from "@/features/starfinder/hooks/useStarfinder"
import { enrichPanchangamDay } from "@/features/panchangam/lib/enrichPanchangamData"
import {
  APP_TIMEZONE,
  CALENDAR_END_DATE,
  STARFINDER_START_DATE,
} from "@/lib/constants"

export default function StarfinderPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState("12:00")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [locationResultsOpen, setLocationResultsOpen] = useState(false)
  const [submitted, setSubmitted] = useState<StarfinderParams | null>(null)

  const { referenceMaps, isLoading: isReferenceLoading } = useReferenceMaps()
  const query = useStarfinder(submitted)
  const locationSearch = useLocationSearch(locationQuery)

  function handleSelectLocation(result: LocationSearchResult) {
    setLatitude(String(result.latitude))
    setLongitude(String(result.longitude))
    setLocationQuery(result.label)
    setLocationResultsOpen(false)
  }

  const lat = Number(latitude)
  const lon = Number(longitude)
  const isValid =
    timeOfDay.length > 0 &&
    latitude.trim().length > 0 &&
    longitude.trim().length > 0 &&
    !Number.isNaN(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    !Number.isNaN(lon) &&
    lon >= -180 &&
    lon <= 180

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isValid) return
    setSubmitted({
      day: date,
      timeOfDay,
      latitude: lat,
      longitude: lon,
      timezone: APP_TIMEZONE,
    })
  }

  const enriched =
    submitted && query.data && !isReferenceLoading
      ? enrichPanchangamDay(query.data, referenceMaps)
      : undefined

  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title="Explore" />

      <div className="flex flex-col gap-3 px-2 lg:grid lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-start lg:gap-4 lg:px-0">
        <form onSubmit={handleSubmit} className="px-2 lg:px-0">
          <Card className="rounded-md py-4">
            <CardContent className="px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="starfinder-location-search">
                    Location
                  </FieldLabel>
                  <Popover
                    open={locationResultsOpen}
                    onOpenChange={setLocationResultsOpen}
                  >
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <MapPinIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="starfinder-location-search"
                          type="text"
                          placeholder="Search for a city or place"
                          className="pl-8"
                          value={locationQuery}
                          onChange={(event) => {
                            const value = event.target.value
                            setLocationQuery(value)
                            setLocationResultsOpen(value.trim().length > 0)
                          }}
                          onFocus={() => {
                            if (
                              locationSearch.data &&
                              locationSearch.data.length > 0
                            ) {
                              setLocationResultsOpen(true)
                            }
                          }}
                          autoComplete="off"
                        />
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-(--radix-popover-trigger-width) p-1"
                      align="start"
                      onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                      {locationQuery.trim().length < 3 ? (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          Type at least 3 characters to search.
                        </p>
                      ) : locationSearch.isFetching ? (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          Searching…
                        </p>
                      ) : locationSearch.data &&
                        locationSearch.data.length > 0 ? (
                        <ul className="flex flex-col">
                          {locationSearch.data.map((result) => (
                            <li key={result.label}>
                              <button
                                type="button"
                                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleSelectLocation(result)}
                              >
                                {result.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          No matching places found.
                        </p>
                      )}
                    </PopoverContent>
                  </Popover>
                  {latitude && longitude && (
                    <p className="text-sm text-muted-foreground">
                      {Number(latitude).toFixed(4)},{" "}
                      {Number(longitude).toFixed(4)}
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="starfinder-date">Date</FieldLabel>
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          id="starfinder-date"
                          type="button"
                          variant="outline"
                          className="justify-start"
                        >
                          <CalendarIcon />
                          {date.toLocaleDateString("default", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={date}
                          defaultMonth={date}
                          startMonth={STARFINDER_START_DATE}
                          endMonth={CALENDAR_END_DATE}
                          disabled={(day) =>
                            day < STARFINDER_START_DATE ||
                            day > CALENDAR_END_DATE
                          }
                          onSelect={(selected) => {
                            if (selected) {
                              setDate(selected)
                              setDatePickerOpen(false)
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="starfinder-time">Time</FieldLabel>
                    <Input
                      id="starfinder-time"
                      type="time"
                      value={timeOfDay}
                      onChange={(event) => setTimeOfDay(event.target.value)}
                      required
                    />
                  </Field>
                </div>

                <Button type="submit" disabled={!isValid || query.isFetching}>
                  {query.isFetching ? "Finding…" : "Find"}
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </form>

        <div className="flex flex-col gap-3 px-2 lg:px-0">
          {submitted ? (
            query.isError ? (
              <p className="text-center text-sm text-destructive">
                {query.error instanceof Error
                  ? query.error.message
                  : "Something went wrong."}
              </p>
            ) : enriched ? (
              <>
                <StarfinderResultPanel
                  queriedDate={submitted.day}
                  timeOfDay={submitted.timeOfDay}
                  kv={enriched.kv}
                  nakshatra={enriched.nakshatra}
                  thithi={enriched.thithi}
                  sunrise={enriched.sunrise}
                  sunset={enriched.sunset}
                  timeZone={submitted.timezone}
                />
                <StarfinderThithiTransitionsCard
                  transitions={enriched.thithi_transitions}
                  currentThithi={enriched.thithi}
                />
                <StarfinderNakshatraTransitionsCard
                  transitions={enriched.nakshatra_transitions}
                  currentNakshatra={enriched.nakshatra}
                />
              </>
            ) : (
              <>
                <StarfinderResultPanelSkeleton />
                <StarfinderTransitionsCardsSkeleton />
              </>
            )
          ) : (
            <Card className="rounded-md py-4">
              <CardContent className="flex min-h-60 flex-col items-center justify-center gap-3 px-4 text-center">
                <Telescope className="size-9 text-muted-foreground" />
                <p className="max-w-64 text-sm text-muted-foreground">
                  Pick a place, date and time to see the panchangam active
                  there.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
