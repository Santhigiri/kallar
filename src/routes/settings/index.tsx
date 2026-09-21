import { createFileRoute } from '@tanstack/react-router'
import RouteErrorFallback from '@/components/shared/RouteErrorFallback'
import SettingsPage from '@/features/settings/components/SettingsPage'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
  errorComponent: RouteErrorFallback,
})
