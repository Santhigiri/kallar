import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { CompactPanchangamData } from "@/features/panchangam/schemas/compactPanchangamData"
import { APP_TIMEZONE } from "@/lib/constants"
import { getFormattedTime } from "@/lib/utils"

export function buildPanchangamColumns(t: TFunction): Array<ColumnDef<CompactPanchangamData>> {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => <SortableHeader label={t("common.date")} column={column} />,
    },
    {
      id: "kollavarsham",
      header: t("dataAdmin.columns.kollavarsham"),
      accessorFn: (row) => `${row.kv.masa} ${row.kv.kv_day}, ${row.kv.kv_year}`,
    },
    {
      accessorKey: "thithi",
      header: ({ column }) => <SortableHeader label={t("dayDetails.thithiLabel")} column={column} />,
    },
    {
      accessorKey: "nakshatra",
      header: ({ column }) => <SortableHeader label={t("dayDetails.nakshatraLabel")} column={column} />,
    },
    {
      accessorKey: "sunrise",
      header: t("dayDetails.sunrise"),
      cell: ({ row }) => getFormattedTime(row.original.sunrise, APP_TIMEZONE),
    },
    {
      accessorKey: "sunset",
      header: t("dayDetails.sunset"),
      cell: ({ row }) => getFormattedTime(row.original.sunset, APP_TIMEZONE),
    },
  ]
}
