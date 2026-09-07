import { addDays, isToday as isTodayFn } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import SunriseSunsetCard from "./SunriseSunsetCard";
import SunriseSunsetCardSkeleton from "./SunriseSunsetCardSkeleton";
import ThithiTransitionCard from "./ThithiTransitionCard";
import { NakshatraTransitionCard } from "./NakshatraTransitionCard";
import { CompactTransitionRowSkeleton } from "./CompactTransitionRowSkeleton";
import UpcomingEventsCard from "./UpcomingEventsCard";
import UpcomingEventsCardSkeleton from "./UpcomingEventsCardSkeleton";
import GuruvaniCard from "./GuruvaniCard";
import MalayalamDateCard from "./MalayalamDateCard";
import MalayalamDateCardSkeleton from "./MalayalamDateCardSkeleton";
import type { DayButton } from "react-day-picker";
import type { ComponentProps } from "react";
import TopAppBar from "@/components/shared/TopAppBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHomePanchangam } from "@/features/day-details/hooks/useHomePanchangam";
import { useLocalSunriseSunset } from "@/features/day-details/hooks/useLocalSunriseSunset";
import { CALENDAR_END_DATE, CALENDAR_START_DATE } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Selected takes the color today used to have (secondary) and today takes
// the color selected used to have (the primary saffron) — inverted on
// purpose so the two states read distinctly from each other.
function DatePickerDayButton({ className, modifiers, ...props }: ComponentProps<typeof DayButton>) {
  // The day cell goes rounded-none specifically when today AND selected
  // coincide (see the `today` classNames override below) — the button
  // itself defaults to rounded-md from the base Button component with no
  // matching override, so without this the cell's orange background peeks
  // through as triangles in the corners where the two roundings disagree.

  return (
    <CalendarDayButton
      modifiers={modifiers}
      className={cn(
        "data-[selected-single=true]:bg-secondary data-[selected-single=true]:text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

export default function DayDetailsPage() {
  const { activeDate, setActiveDate, activeDateData, upcomingEvents, isLoading } = useHomePanchangam();
  const { sunrise, sunset, timeZone } = useLocalSunriseSunset(activeDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const isToday = isTodayFn(activeDate);

  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title="Today" />

      <div className="flex flex-col gap-4">

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-playfair-display text-2xl leading-tight font-semibold md:text-3xl">
                {activeDate.toLocaleDateString("en-IN", { weekday: "long" })}
              </h2>
              {isToday && (
                <span className="shrink-0 rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-800">
                  Today
                </span>
              )}
            </div>
            {activeDateData ? (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {activeDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {" · Kollavarsham "}
                {activeDateData.kv.kv_day} {activeDateData.kv.kv_month_name_en} {activeDateData.kv.kv_year}
              </p>
            ) : (
              <Skeleton className="mt-2 h-4 w-48" />
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous day"
              onClick={() => setActiveDate(addDays(activeDate, -1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => setActiveDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next day"
              onClick={() => setActiveDate(addDays(activeDate, 1))}
            >
              <ChevronRight />
            </Button>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Pick a date">
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="end"
                onOpenAutoFocus={(event) => event.preventDefault()}
              >
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={activeDate}
                  defaultMonth={activeDate}
                  startMonth={CALENDAR_START_DATE}
                  endMonth={CALENDAR_END_DATE}
                  disabled={(date) =>
                    date < CALENDAR_START_DATE || date > CALENDAR_END_DATE
                  }
                  onSelect={(date) => {
                    if (date) {
                      setActiveDate(date);
                      setDatePickerOpen(false);
                    }
                  }}
                  classNames={{
                    today: "rounded-lg bg-primary text-primary-foreground font-semibold data-[selected=true]:bg-transparent",
                  }}
                  components={{
                    DayButton: DatePickerDayButton,
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="md:col-span-2">
            <GuruvaniCard />
          </div>

          {activeDateData ? (
            <MalayalamDateCard
              thithi={activeDateData.thithi}
              thithiTransitions={activeDateData.thithi_transitions}
              nakshatra={activeDateData.nakshatra}
              nakshatraTransitions={activeDateData.nakshatra_transitions}
              kv={activeDateData.kv}
            />
          ) : (
            <MalayalamDateCardSkeleton />
          )}

          {sunrise && sunset ? (
            <SunriseSunsetCard
              sunrise={sunrise}
              sunset={sunset}
              timeZone={timeZone}
              nazhika={activeDateData?.nazhika_from_sunrise}
            />
          ) : (
            <SunriseSunsetCardSkeleton />
          )}

          {activeDateData ? (
            <ThithiTransitionCard
              transitions={activeDateData.thithi_transitions}
              current_thithi={activeDateData.thithi}
            />
          ) : (
            <CompactTransitionRowSkeleton />
          )}

          {activeDateData ? (
            <NakshatraTransitionCard
              transitions={activeDateData.nakshatra_transitions}
              current_nakshatra={activeDateData.nakshatra}
            />
          ) : (
            <CompactTransitionRowSkeleton />
          )}

          <div className="md:col-span-2">
            {isLoading ? (
              <UpcomingEventsCardSkeleton />
            ) : (
              <UpcomingEventsCard events={upcomingEvents} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
