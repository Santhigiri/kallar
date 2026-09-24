import { useState } from "react"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
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
      toast.error(t("calendar.exportDialog.downloadError"))
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getSanthigiriEventsCalendarIcsUrl())
      toast.success(t("calendar.exportDialog.copySuccess"))
    } catch {
      toast.error(t("calendar.exportDialog.copyError"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("calendar.exportDialog.title")}</DialogTitle>
          <DialogDescription>{t("calendar.exportDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full justify-start"
          >
            <Download />
            {isDownloading ? t("calendar.exportDialog.downloading") : t("calendar.exportDialog.downloadIcs")}
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyUrl}
            className="w-full justify-start"
          >
            <Copy />
            {t("calendar.exportDialog.copyUrl")}
          </Button>

          <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">
              {t("calendar.exportDialog.addToGoogle")}
            </p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>{t("calendar.exportDialog.step1")}</li>
              <li>
                {t("calendar.exportDialog.step2Prefix")}{" "}
                <span className="font-medium text-foreground">
                  {t("calendar.exportDialog.otherCalendars")}
                </span>{" "}
                → <span className="font-medium text-foreground">+</span> →{" "}
                <span className="font-medium text-foreground">
                  {t("calendar.exportDialog.fromUrl")}
                </span>
                .
              </li>
              <li>{t("calendar.exportDialog.step3")}</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
