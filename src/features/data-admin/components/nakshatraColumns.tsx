import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { Nakshatra } from "@/features/panchangam/schemas/panchangamData"
import { localizedName } from "@/lib/utils"

export function buildNakshatraColumns(t: TFunction): Array<ColumnDef<Nakshatra>> {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader label={t("common.id")} column={column} />,
    },
    {
      id: "en",
      header: ({ column }) => <SortableHeader label={t("common.name")} column={column} />,
      accessorFn: (row) => localizedName(row, "en"),
    },
    {
      id: "ml",
      header: t("common.malayalam"),
      accessorFn: (row) => localizedName(row, "ml"),
    },
  ]
}
