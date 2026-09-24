import { useTranslation } from "react-i18next"

export default function ComingSoonTab({ label }: { label: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
      {t("dataAdmin.comingSoon", { label })}
    </div>
  )
}
