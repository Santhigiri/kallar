import { Menu } from "lucide-react"
import type { JSX } from "react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export type AppBarProps = {
  title: string
  actions?: JSX.Element
}

export default function TopAppBar({ title, actions }: AppBarProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <>
      {/* position: fixed (not sticky) — sticky lives inside main's scrolling
          box and visually bounces along with iOS's rubber-band overscroll.
          fixed is anchored to the viewport, so it's unaffected by that. It
          matches main's icon-width sidebar offset (the sidebar overlays,
          rather than pushes, when expanded — see Sidebar.tsx's sidebar-gap). */}
      <div className="fixed top-0 left-0 right-0 z-30 grid h-11 grid-cols-[2.25rem_1fr_2.25rem] items-center bg-card px-2 md:left-(--sidebar-width-icon)">
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu />
          </Button>
        </div>
        <p className="text-primary text-center align-top text-xl font-semibold font-playfair-display">{title}</p>
        <div className="flex items-center justify-end">{actions}</div>
      </div>
      {/* Spacer reserving the fixed bar's height so content isn't hidden under it */}
      <div className="h-11" aria-hidden="true" />
    </>
  )
}
