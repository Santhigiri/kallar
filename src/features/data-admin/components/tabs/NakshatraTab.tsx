import { useTranslation } from "react-i18next"
import { buildNakshatraColumns } from "../nakshatraColumns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { useNakshatraReference } from "@/features/panchangam/hooks/usePanchangamReference"

export default function NakshatraTab() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useNakshatraReference()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dayDetails.nakshatraLabel")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
        {isError && (
          <p className="text-sm text-destructive">{t("dataAdmin.nakshatraTab.loadError")}</p>
        )}
        {data && <DataTable columns={buildNakshatraColumns(t)} data={data} />}
      </CardContent>
    </Card>
  )
}
