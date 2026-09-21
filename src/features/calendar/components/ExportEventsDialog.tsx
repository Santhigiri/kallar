import { useState } from "react"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  downloadSanthigiriEventsCalendarIcs,
  getSanthigiriEventsCalendarIcsUrl,
} from "@/features/santhigiri-events/api/santhigiriEvents"

export default function ExportEventsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await downloadSanthigiriEventsCalendarIcs()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "santhigiri-events.ics"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Failed to download calendar file")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getSanthigiriEventsCalendarIcsUrl())
      toast.success("Calendar URL copied to clipboard")
    } catch {
      toast.error("Failed to copy calendar URL")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Santhigiri events</DialogTitle>
          <DialogDescription>
            Download a one-time calendar file, or subscribe to the live feed URL
            so new events keep syncing automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full justify-start"
          >
            <Download />
            {isDownloading ? "Downloading..." : "Download .ics file"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyUrl}
            className="w-full justify-start"
          >
            <Copy />
            Copy calendar URL
          </Button>

          <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">
              Add to Google Calendar
            </p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Copy the calendar URL above.</li>
              <li>
                In Google Calendar, go to{" "}
                <span className="font-medium text-foreground">
                  Other calendars
                </span>{" "}
                → <span className="font-medium text-foreground">+</span> →{" "}
                <span className="font-medium text-foreground">From URL</span>.
              </li>
              <li>Paste the URL and click Add calendar.</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
