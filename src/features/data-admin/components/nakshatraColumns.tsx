import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { Nakshatra } from "@/features/panchangam/schemas/panchangamData"

export function buildNakshatraColumns(t: TFunction): Array<ColumnDef<Nakshatra>> {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader label={t("common.id")} column={column} />,
    },
    {
      accessorKey: "en",
      header: ({ column }) => <SortableHeader label={t("common.name")} column={column} />,
    },
    {
      accessorKey: "ml",
      header: t("common.malayalam"),
    },
  ]
}
