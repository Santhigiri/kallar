import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError, FieldGroup } from "@/components/ui/field"

type SettingCardProps = {
  title: string
  description: string
  isDirty: boolean
  isSaving: boolean
  error: string | null
  updatedAt?: string | null
  updatedBy?: string | null
  onSave: () => void
  onReset: () => void
  children: ReactNode
}

export function SettingCard({
  title,
  description,
  isDirty,
  isSaving,
  error,
  updatedAt,
  updatedBy,
  onSave,
  onReset,
  children,
}: SettingCardProps) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>{children}</FieldGroup>
        {error && <FieldError className="mt-4">{error}</FieldError>}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <p className="text-xs text-muted-foreground">
          {updatedAt
            ? (() => {
                const time = formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
                return updatedBy
                  ? t("settings.card.lastUpdatedBy", { time, by: updatedBy })
                  : t("settings.card.lastUpdated", { time })
              })()
            : t("settings.card.usingDefault")}
        </p>
        <div className="flex gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isSaving}
            >
              {t("settings.card.reset")}
            </Button>
          )}
          <Button type="button" size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
            {isSaving ? t("settings.card.saving") : t("settings.card.save")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
