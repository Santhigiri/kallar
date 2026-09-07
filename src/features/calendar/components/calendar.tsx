import { createContext, useContext, useRef } from "react"
import { ChevronLeft, ChevronRight, InfoIcon, SunriseIcon, SunsetIcon } from "lucide-react";
import CalendarGridSkeleton from "./CalendarGridSkeleton";
import type { ComponentProps, TouchEvent } from "react"
import type { PanchangamDayData } from "@/features/panchangam/schemas/panchangamData";
import type { DayButton } from "react-day-picker";
import DateHeader from "@/features/panchangam/components/DateHeader";
import { useCalendarPanchangam } from "@/features/calendar/hooks/useCalendarPanchangam";
import { dateToKey } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { APP_TIMEZONE, CALENDAR_END_DATE, CALENDAR_START_DATE, POURNAMI_EVENT_ID } from "@/lib/constants";
import { cn, getFormattedTime } from "@/lib/utils";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import TopAppBar from "@/components/shared/TopAppBar";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const YEAR_OPTIONS = Array.from(
  { length: CALENDAR_END_DATE.getFullYear() - CALENDAR_START_DATE.getFullYear() + 1 },
  (_, i) => CALENDAR_START_DATE.getFullYear() + i
)

type CalendarContextData = {
  monthData: Record<string, PanchangamDayData> | undefined
  activeMonth: Date
  setActiveMonth: (date: Date) => void
  startKey: string
  endKey: string
}

const CalendarDataContext = createContext<CalendarContextData | null>(null)

function DayDetailsHoverContent({ date, data }: { date: Date; data: PanchangamDayData }) {
  return (
    <div className="flex flex-col gap-2">
      <DateHeader date={date} kv_date={data.kv} />
      <Separator />
      <div className="flex flex-row justify-between text-xs font-inter text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <SunriseIcon className="h-3.5 w-3.5" />
          {getFormattedTime(data.sunrise, APP_TIMEZONE)}
        </div>
        <div className="flex items-center gap-1.5">
          <SunsetIcon className="h-3.5 w-3.5" />
          {getFormattedTime(data.sunset, APP_TIMEZONE)}
        </div>
      </div>
      <div className="flex flex-col gap-0.5 text-xs">
        <p><span className="font-semibold">Thithi:</span> {data.thithi.en} ({data.thithi.paksha.en})</p>
        <p><span className="font-semibold">Nakshatra:</span> {data.nakshatra.en}</p>
      </div>
      {data.santhigiri_significant_dates.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-1">
            {data.santhigiri_significant_dates.map((significance) => (
              <p key={significance.name} className="text-xs font-semibold text-primary">
                {significance.name}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PanchangamDayButton({ day, modifiers, className, children: _children, ...props }: ComponentProps<typeof DayButton>) {
  const ctx = useContext(CalendarDataContext)
  const key = dateToKey(day.date)
  const dateData = ctx?.monthData?.[key]
  const isPournami = dateData?.santhigiri_significant_dates.some(e => e.id === POURNAMI_EVENT_ID) ?? false
  const isNeighbouringMonth = ctx ? day.date.getMonth() !== ctx.activeMonth.getMonth() : false

  const button = (
    <CalendarDayButton
      day={day}
      modifiers={modifiers}
      className={cn(
        "aspect-auto h-full min-h-14 md:min-h-24 min-w-0 gap-0.5 items-start justify-start rounded-none p-0 overflow-hidden cursor-default data-[selected-single=true]:bg-transparent data-[selected-single=true]:text-inherit",
        isPournami && "bg-moon",
        className
      )}
      {...props}
      // Clicking doesn't do anything (no onSelect is wired up) — override
      // DayPicker's own click handler so it can't quietly flip internal
      // selection state and highlight the day for no functional reason.
      onClick={(e) => e.preventDefault()}
    >
      {dateData?.kv.kv_day === 1 ? (
        <p className="bg-primary text-[8px] lg:text-[12px] font-bold mb-1 text-primary-foreground w-full text-center leading-snug break-words">
          {dateData.kv.kv_month_name_ml}
        </p>
      ) : (
        <div className="h-4" />
      )}
      <p className={cn("text-[14px] lg:text-3xl w-full text-center align-middle pt-0.5 md:pt-3 font-bold", isNeighbouringMonth && "opacity-40")}>
        {day.date.getDate()}
      </p>
      <div className={cn("flex items-baseline justify-between w-full min-w-0 gap-1 pb-1 px-1 mt-auto", isNeighbouringMonth && "opacity-40")}>
        <p className="text-[8px] lg:text-[14px] leading-tight font-semibold text-muted-foreground shrink-0">{dateData?.kv.kv_day}</p>
        <p className="text-[8px] lg:text-[14px] leading-tight font-semibold text-right truncate">{dateData?.nakshatra.ml}</p>
      </div>
    </CalendarDayButton>
  )

  if (!dateData) return button

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>{button}</HoverCardTrigger>
      <HoverCardContent className="w-72 pointer-events-none">
        <DayDetailsHoverContent date={day.date} data={dateData} />
      </HoverCardContent>
    </HoverCard>
  )
}

function PanchangamMonthCaption({ calendarMonth }: { calendarMonth: { date: Date }; displayIndex: number }) {
  const ctx = useContext(CalendarDataContext)
  const startML = ctx?.monthData?.[ctx.startKey]?.kv.kv_month_name_ml ?? ""
  const endML = ctx?.monthData?.[ctx.endKey]?.kv.kv_month_name_ml ?? ""

  const previousMonth = new Date(calendarMonth.date.getFullYear(), calendarMonth.date.getMonth() - 1, 1)
  const nextMonth = new Date(calendarMonth.date.getFullYear(), calendarMonth.date.getMonth() + 1, 1)
  const canGoPrevious = previousMonth >= CALENDAR_START_DATE
  const canGoNext = nextMonth <= CALENDAR_END_DATE

  return (
    <div className="flex h-auto w-full flex-col items-center gap-1 py-1">
      <div className="flex w-full items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Previous month"
          disabled={!canGoPrevious}
          onClick={() => ctx?.setActiveMonth(previousMonth)}
          className="text-primary hover:text-primary [&_svg]:size-6"
        >
          <ChevronLeft />
        </Button>
        <div className="flex items-center gap-1">
          <Select
            value={String(calendarMonth.date.getMonth())}
            onValueChange={(value) =>
              ctx?.setActiveMonth(new Date(calendarMonth.date.getFullYear(), Number(value), 1))
            }
          >
            <SelectTrigger
              aria-label="Month"
              className="h-auto gap-1 border-none bg-transparent p-0 text-lg font-bold text-primary shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&_svg]:text-primary"
            >
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
            value={String(calendarMonth.date.getFullYear())}
            onValueChange={(value) =>
              ctx?.setActiveMonth(new Date(Number(value), calendarMonth.date.getMonth(), 1))
            }
          >
            <SelectTrigger
              aria-label="Year"
              className="h-auto gap-1 border-none bg-transparent p-0 text-lg font-bold text-primary shadow-none hover:bg-transparent focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&_svg]:text-primary"
            >
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => ctx?.setActiveMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="text-muted-foreground hover:text-foreground"
          >
            This month
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Next month"
          disabled={!canGoNext}
          onClick={() => ctx?.setActiveMonth(nextMonth)}
          className="text-primary hover:text-primary [&_svg]:size-6"
        >
          <ChevronRight />
        </Button>
      </div>
      {(startML || endML) && (
        <span className="text-xs text-muted-foreground font-medium">{startML} / {endML}</span>
      )}
    </div>
  )
}

const SWIPE_MIN_DISTANCE = 50

export default function CalendarCustomDays() {
  const {
    activeDate,
    setActiveDate,
    monthData,
    isLoading,
    monthEvents,
    startKey,
    endKey,
  } = useCalendarPanchangam();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y

    if (Math.abs(dx) < SWIPE_MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return

    const targetMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + (dx < 0 ? 1 : -1), 1)
    if (targetMonth < CALENDAR_START_DATE || targetMonth > CALENDAR_END_DATE) return
    setActiveDate(targetMonth)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-stretch">
        <TopAppBar title="Calendar" />
        <div className="w-full flex flex-col gap-2 items-center">
          <div className="w-full">
            <CalendarGridSkeleton />
            <div className="grid grid-flow-rows auto-rows-min mt-2 gap-1">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-row items-center gap-4 border-b border-primary/20 px-2 py-1.5 last:border-b-0"
                >
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title="Calendar" />
      <CalendarDataContext.Provider value={{ monthData, activeMonth: activeDate, setActiveMonth: setActiveDate, startKey, endKey }}>
        <div className="w-full flex flex-col gap-2 items-center">
          <div className="w-full touch-pan-y" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <Calendar
              mode="single"
              month={activeDate}
              onMonthChange={setActiveDate}
              disabled={(date) => date < CALENDAR_START_DATE || date > CALENDAR_END_DATE}
              showOutsideDays
              className="w-full max-w-full overflow-hidden rounded-2xl border-2 border-border p-0"
              classNames={{
                months: "w-full",
                month: "w-full flex flex-col gap-0",
                month_caption: "flex w-full items-center justify-center border-b border-border",
                // grid-cols-7 (repeat(7, minmax(0, 1fr))) rather than flex — the
                // explicit 0 track minimum makes every column truly equal-width
                // regardless of content, instead of fighting per-item min-width.
                weekdays: "grid grid-cols-7 bg-muted border-b border-border",
                weekday: "overflow-hidden text-center text-xs font-bold py-1 capitalize",
                week: "grid grid-cols-7 border-b border-border last:border-b-0",
                day: "group/day relative overflow-hidden border-r border-border last:border-r-0 p-0 select-none",
                today: "bg-primary/15",
                outside: "",
                disabled: "opacity-30",
              }}
              components={{
                DayButton: PanchangamDayButton,
                MonthCaption: PanchangamMonthCaption,
                Nav: () => <></>,
              }}
            />
            {monthEvents.length > 0 && (
              <div className="grid grid-flow-rows auto-rows-min mt-2 gap-1">
                {monthEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex flex-row items-center gap-4 border-b border-primary/20 px-2 py-1.5 last:border-b-0 text-primary font-semibold font-inter text-xs md:text-sm"
                  >
                    <p>{event.dt.getDate()}</p>
                    <p>{event.e.name}</p>
                    <HoverCard openDelay={150} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${event.e.name} details`}
                          className="text-primary/70 hover:text-primary"
                        >
                          <InfoIcon className="h-4 w-4" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        <p className="font-playfair-display font-bold text-primary">{event.e.name}</p>
                        <p className="mt-1 font-inter text-xs font-normal text-muted-foreground md:text-sm">
                          {event.e.description}
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CalendarDataContext.Provider>
    </div>
  )
}
