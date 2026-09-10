import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, Database, Home, LogOutIcon, Settings, Telescope, User } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { LoginDialog } from "@/features/auth/components/LoginDialog";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LocationPicker from "@/components/shared/LocationPicker";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
} from "@/components/ui/sidebar";

type NavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
};

const baseNavItems: Array<NavItemProps> = [
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/", icon: Home, label: "Today" },
  { to: "/starfinder", icon: Telescope, label: "Explore" },
];

const adminNavItems: Array<NavItemProps> = [
  { to: "/data", icon: Database, label: "Data" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { state, isMobile } = useSidebar();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, isVerifying, username, role, logout } = useAuth();
  const pathname = useRouterState({ select: (routerState) => routerState.location.pathname });
  const navigate = useNavigate();
  const navItems = role === "admin" ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  // The mobile sidebar is a full-width sheet, not an icon rail — labels
  // always show there regardless of the desktop expand/collapse state.
  const showLabels = isMobile || state === "expanded";
  const gridColsClass = navItems.length === 5 ? "grid-cols-5" : "grid-cols-3";
  // The location picker drives Today's and Calendar's data. Explore has its
  // own independent place search (any location, not just this list), so it
  // stays out of the sidebar there to avoid implying a connection that
  // doesn't exist.
  const showLocationPicker = pathname === "/" || pathname === "/calendar";

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <>
      <SidebarPrimitive collapsible="icon">
        <SidebarHeader className="flex-row items-start justify-between gap-2 border-b border-sidebar-border group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-playfair-display text-lg leading-tight font-semibold">Panchangam</p>
            <p className="truncate text-xs text-muted-foreground">Santhigiri Ashram</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 group-data-[collapsible=icon]:flex-col">
            <ThemeToggle />
            <SidebarTrigger />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ to, icon: Icon, label }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild isActive={pathname === to} tooltip={label}>
                      <Link to={to}>
                        <Icon />
                        <span className="group-data-[collapsible=icon]:hidden">{label}</span>
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
          {isVerifying ? null : isAuthenticated ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={`Log out (${username})`}>
                  <LogOutIcon />
                  <span className="group-data-[collapsible=icon]:hidden">Log out ({username})</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsLoginOpen(true)} tooltip="Log in">
                  <User />
                  <span className="group-data-[collapsible=icon]:hidden">Log in</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarFooter>
      </SidebarPrimitive>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      {/* ===== MOBILE BOTTOM NAV (Fixed Bottom, mobile-only) =====
          Primary navigation on small screens — separate from the sidebar drawer above,
          which mobile still reaches via the hamburger for location/login. */}
      <nav
        className={`
          md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar drop-shadow-sm
          text-sidebar-foreground z-30 safe-area-inset-bottom
        `}
      >
        <div className={`grid h-full ${gridColsClass} py-2`}>
          {navItems.map(({ to, icon: Icon, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-1 pb-2 px-4 rounded-md transition-colors hover:bg-sidebar-accent"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`
                          flex items-center justify-center rounded-xl px-3 p-1 transition-colors
                          ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : ""}
                        `}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="text-xs">{label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
