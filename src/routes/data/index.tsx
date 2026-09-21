import { createFileRoute } from '@tanstack/react-router'
import RouteErrorFallback from '@/components/shared/RouteErrorFallback'
import PanchangamDataPage from '@/features/data-admin/components/PanchangamDataPage'

export const Route = createFileRoute('/data/')({
  component: PanchangamDataPage,
  errorComponent: RouteErrorFallback,
})
