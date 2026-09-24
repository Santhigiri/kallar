import { useTranslation } from "react-i18next"
import { buildThithiColumns } from "../thithiColumns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { useThithiReference } from "@/features/panchangam/hooks/usePanchangamReference"

export default function ThithiTab() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useThithiReference()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dayDetails.thithiLabel")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
        {isError && (
          <p className="text-sm text-destructive">{t("dataAdmin.thithiTab.loadError")}</p>
        )}
        {data && <DataTable columns={buildThithiColumns(t)} data={data} />}
      </CardContent>
    </Card>
  )
}
