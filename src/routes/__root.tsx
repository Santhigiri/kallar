import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import appCss from "../styles.css?url"
import { queryClient } from "@/lib/query-client"
import { RefreshPrompt } from "@/components/shared/RefreshPrompt"
import RouteErrorFallback from "@/components/shared/RouteErrorFallback"
import Sidebar from "@/components/shared/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/hooks/useAuth"
import { SelectedLocationProvider } from "@/hooks/useSelectedLocation"
import { APP_ENV } from "@/lib/version"

const TITLE_BY_ENV: Record<string, string> = {
  dev: "Pournami Calendar (Dev)",
  staging: "Pournami Calendar (Staging)",
  local: "Pournami Calendar (Local)",
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: TITLE_BY_ENV[APP_ENV] ?? "Pournami Calendar",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  errorComponent: RouteErrorFallback,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <SidebarProvider defaultOpen={false} className="h-dvh bg-card overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overscroll-y-contain p-2 pb-16 md:pb-2">
          <Outlet /> {/* Child routes render here */}
        </main>
      </SidebarProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SelectedLocationProvider>
          <HeadContent />
          {children}
          <RefreshPrompt />
          <Toaster />
        </SelectedLocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
