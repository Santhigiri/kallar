import { createFileRoute } from '@tanstack/react-router'
import RouteErrorFallback from '@/components/shared/RouteErrorFallback'
import CalendarCustomDays from '@/features/calendar/components/calendar'

export const Route = createFileRoute('/calendar/')({
  component: CalendarCustomDays,
  errorComponent: RouteErrorFallback,
})

