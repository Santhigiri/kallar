import { HeadContent, createRootRoute, Outlet } from "@tanstack/react-router"
import appCss from "../styles.css?url"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { RefreshPrompt } from "@/components/shared/RefreshPrompt"
import Sidebar from "@/components/shared/Sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/features/auth/hooks/useAuth"
import { MobileSidebarProvider } from "@/hooks/useMobileSidebar"
import { SelectedLocationProvider } from "@/hooks/useSelectedLocation"

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
        title: "Pournami Calendar",
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
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <div className="flex h-dvh w-full bg-card overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overscroll-y-contain p-2 pb-16 md:ml-16 md:pb-2">
          <Outlet /> {/* Child routes render here */}
        </main>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MobileSidebarProvider>
          <SelectedLocationProvider>
            <HeadContent />
            {children}
            <RefreshPrompt />
            <Toaster />
          </SelectedLocationProvider>
        </MobileSidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
