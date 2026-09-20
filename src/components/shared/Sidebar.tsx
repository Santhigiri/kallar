import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  Calendar,
  Database,
  Home,
  LogOutIcon,
  Settings,
  Telescope,
  User,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { LoginDialog } from "@/features/auth/components/LoginDialog"
import { SignupDialog } from "@/features/auth/components/SignupDialog"
import { ForgotPasswordDialog } from "@/features/auth/components/ForgotPasswordDialog"
import ThemeToggle from "@/components/shared/ThemeToggle"
import LocationPicker from "@/components/shared/LocationPicker"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { isAtLeast } from "@/lib/auth/roles"
import { APP_ENV, APP_VERSION } from "@/lib/version"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

type NavItemProps = {
  to: string
  icon: LucideIcon
  label: string
}

const baseNavItems: Array<NavItemProps> = [
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/", icon: Home, label: "Today" },
  { to: "/starfinder", icon: Telescope, label: "Explore" },
]

const dataNavItem: NavItemProps = { to: "/data", icon: Database, label: "Data" }
const settingsNavItem: NavItemProps = { to: "/settings", icon: Settings, label: "Settings" }

export default function Sidebar() {
  const { state, isMobile, setOpen } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const { isAuthenticated, isVerifying, displayName, role, logout } = useAuth()
  const pathname = useRouterState({
    select: (routerState) => routerState.location.pathname,
  })
  const navigate = useNavigate()
  const navItems = [
    ...baseNavItems,
    ...(isAtLeast(role, "EDITOR") ? [dataNavItem] : []),
    ...(isAtLeast(role, "ADMIN") ? [settingsNavItem] : []),
  ]
  // The mobile sidebar is a full-width sheet, not an icon rail — labels
  // always show there regardless of the desktop expand/collapse state.
  const showLabels = isMobile || state === "expanded"
  const isCollapsed = !isMobile && state === "collapsed"
  const gridColsClass =
    navItems.length === 5
      ? "grid-cols-5"
      : navItems.length === 4
        ? "grid-cols-4"
        : "grid-cols-3"
  // The location picker drives Today's and Calendar's data. Explore has its
  // own independent place search (any location, not just this list), so it
  // stays out of the sidebar there to avoid implying a connection that
  // doesn't exist.
  const showLocationPicker = pathname === "/" || pathname === "/calendar"

  function handleLogout() {
    logout()
    navigate({ to: "/" })
  }

  // Desktop-only: the expanded icon-rail sidebar overlays the page rather
  // than pushing it, so a click anywhere outside it should collapse it back
  // to the icon rail. Mobile's Sheet already closes on outside click via
  // Radix's own overlay.
  useEffect(() => {
    if (isMobile || state !== "expanded") return

    function handlePointerDown(event: PointerEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isMobile, state, setOpen])

  return (
    <>
      <div ref={sidebarRef} className="contents">
        <SidebarPrimitive collapsible="icon">
          <SidebarHeader className="flex-row items-start justify-between gap-2 border-b border-sidebar-border group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate font-playfair-display text-lg leading-tight font-semibold">
                Panchangam
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Santhigiri Ashram
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 group-data-[collapsible=icon]:flex-col">
              {!isCollapsed && <ThemeToggle />}
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(({ to, icon: Icon, label }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === to}
                        tooltip={label}
                      >
                        <Link to={to}>
                          <Icon />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            {showLocationPicker && (
              <>
                <LocationPicker showLabel={showLabels} />
                <SidebarSeparator />
              </>
            )}
            {isCollapsed && (
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
            )}
            {isVerifying ? null : isAuthenticated ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip={displayName ? `Log out (${displayName})` : "Log out"}
                  >
                    <LogOutIcon />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {displayName ? `Log out (${displayName})` : "Log out"}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsLoginOpen(true)}
                    tooltip="Log in"
                  >
                    <User />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Log in
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {showLabels && (
              <p className="truncate px-2 text-[10px] text-muted-foreground">
                {APP_ENV === "prod" ? APP_VERSION : `${APP_ENV} · ${APP_VERSION}`}
              </p>
            )}
          </SidebarFooter>
        </SidebarPrimitive>
      </div>

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onForgotPassword={() => {
          setIsLoginOpen(false)
          setIsForgotPasswordOpen(true)
        }}
        onSignUp={() => {
          setIsLoginOpen(false)
          setIsSignupOpen(true)
        }}
      />
      <SignupDialog open={isSignupOpen} onOpenChange={setIsSignupOpen} />
      <ForgotPasswordDialog
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      />

      {/* ===== MOBILE BOTTOM NAV (Fixed Bottom, mobile-only) =====
          Primary navigation on small screens — separate from the sidebar drawer above,
          which mobile still reaches via the hamburger for location/login. */}
      <nav
        className={`safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-30 h-16 bg-sidebar text-sidebar-foreground drop-shadow-sm md:hidden`}
      >
        <div className={`grid h-full ${gridColsClass} py-2`}>
          {navItems.map(({ to, icon: Icon, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 rounded-md px-4 pb-2 transition-colors hover:bg-sidebar-accent"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex items-center justify-center rounded-xl p-1 px-3 transition-colors ${isActive ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground" : ""} `}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="text-xs">{label}</span>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
