import { createFileRoute } from '@tanstack/react-router'
import RouteErrorFallback from '@/components/shared/RouteErrorFallback'
import StarfinderPage from '@/features/starfinder/components/StarfinderPage'

export const Route = createFileRoute('/starfinder/')({
  component: StarfinderPage,
  errorComponent: RouteErrorFallback,
})
