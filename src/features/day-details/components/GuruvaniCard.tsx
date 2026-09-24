import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useRandomGuruvani } from "@/features/guruvani/hooks/useGuruvani"
import { getGuruvaniText } from "@/features/guruvani/schemas/guruvani"
import { cn } from "@/lib/utils"

export default function GuruvaniCard() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useRandomGuruvani()
  const [open, setOpen] = useState(false)

  const currentLanguage = i18n.language.startsWith("ml") ? "ml" : "en"
  const otherLanguage = currentLanguage === "en" ? "ml" : "en"
  const primaryText = data && (getGuruvaniText(data, currentLanguage) ?? getGuruvaniText(data, otherLanguage))
  const secondaryText = data && getGuruvaniText(data, otherLanguage)

  return (
    <Card className="rounded-md py-3">
      <CardContent className="flex flex-col gap-1 px-4">
        <p className="font-semibold text-xs text-muted-foreground uppercase">
          {t("dayDetails.guruvani.title")}
        </p>
        {isLoading && (
          <div className="flex flex-col gap-2 pt-1">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        )}
        {isError && (
          <p className="font-inter text-xs text-muted-foreground">
            {t("dayDetails.guruvani.errorFallback")}
          </p>
        )}
        {data && primaryText && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <p className="font-playfair-display font-medium text-base md:text-lg">{primaryText}</p>
            {secondaryText && secondaryText !== primaryText && (
              <>
                <CollapsibleContent className="flex flex-col gap-2 pt-2">
                  <Separator />
                  <p className="font-inter text-sm text-muted-foreground md:text-[15px]">
                    {secondaryText}
                  </p>
                </CollapsibleContent>
                <CollapsibleTrigger className="mt-1 flex items-center gap-1 self-start font-inter text-xs font-medium text-primary">
                  {open ? t("dayDetails.guruvani.showLess") : t("dayDetails.guruvani.readFull")}
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
                  />
                </CollapsibleTrigger>
              </>
            )}
          </Collapsible>
        )}
        {data && !primaryText && (
          <p className="font-inter text-xs text-muted-foreground">
            {t("dayDetails.guruvani.errorFallback")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
