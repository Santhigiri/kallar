import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Calendar, Database, LogOutIcon, Menu, Settings, Sun, Telescope, User, X } from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { LoginDialog } from "@/features/auth/components/LoginDialog";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LocationPicker from "@/components/shared/LocationPicker";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMobileSidebar } from "@/hooks/useMobileSidebar";

type NavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
};

const baseNavItems: Array<NavItemProps> = [
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/", icon: Sun, label: "Today" },
  { to: "/starfinder", icon: Telescope, label: "Explore" },
];

const adminNavItems: Array<NavItemProps> = [
  { to: "/data", icon: Database, label: "Data" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, isVerifying, username, role, logout } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileSidebar();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const navItems = role === "admin" ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  const showLabels = !isCollapsed || isMobileMenuOpen;
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
      {/* Backdrop behind the mobile drawer — tap to dismiss */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR (Fixed Left, all breakpoints) =====
          Mobile: hidden (w-0) until opened via the TopAppBar hamburger, then a w-64 drawer that
          stops above the bottom nav (bottom-16) so the two never overlap and the login button
          at the bottom of the drawer stays fully visible.
          Desktop (md+): full height (bottom-0), toggled between icon-only (w-16) and labeled (w-64). */}
      <aside
        className={`
          flex flex-col fixed left-0 top-0 bottom-16 md:bottom-0 bg-sidebar drop-shadow-sm
          text-sidebar-foreground transition-all duration-300 ease-in-out z-50 overflow-hidden
          ${isMobileMenuOpen ? "w-64" : "w-0"}
          ${isCollapsed ? "md:w-16" : "md:w-64"}
          md:overflow-visible
        `}
      >
        <div className="flex items-start justify-between gap-2 border-b border-sidebar-border p-4">
          {showLabels ? (
            <div className="min-w-0">
              <p className="truncate font-playfair-display text-lg leading-tight font-semibold">Panchangam</p>
              <p className="truncate text-xs text-muted-foreground">Santhigiri Ashram</p>
            </div>
          ) : (
            <div />
          )}
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            {/* Desktop icon-only/labeled toggle */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:inline-flex appearance-none px-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
            {/* Mobile drawer close button */}
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="md:hidden appearance-none rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobileMenu}
                activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" }}
                className={`
                  flex items-center gap-3 pl-3.5 py-3 m-2 rounded-full
                  transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
              >
                <Icon size={20} className="min-w-5" />
                {showLabels && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="w-full mt-auto flex flex-col gap-2 p-2 border-t border-sidebar-border">
          {showLocationPicker && <LocationPicker showLabel={showLabels} />}
          {isVerifying ? null : isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className={`
                  flex w-full items-center justify-start gap-3 appearance-none px-4 py-3 rounded-md
                  transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
            >
              <LogOutIcon size={20} className="min-w-5" />
              {showLabels && <span className="truncate">Log out ({username})</span>}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className={`
                  flex w-full items-center justify-start gap-3 appearance-none px-4 py-3 rounded-md
                  transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                `}
            >
              <User size={20} className="min-w-5" />
              {showLabels && <span className="truncate">Log in</span>}
            </button>
          )}
        </div>
      </aside>

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />

      {/* ===== MOBILE BOTTOM NAV (Fixed Bottom, mobile-only, in addition to the sidebar) =====
          Fixed h-16 so the sidebar drawer's bottom-16 offset lines up exactly, with no gap or overlap. */}
      <nav
        className={`
          md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar drop-shadow-sm
          text-sidebar-foreground z-50 safe-area-inset-bottom
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
