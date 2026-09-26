import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { Thithi } from "@/features/panchangam/schemas/panchangamData"
import { localizedName } from "@/lib/utils"

export function buildThithiColumns(t: TFunction): Array<ColumnDef<Thithi>> {
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
    {
      id: "paksha",
      header: ({ column }) => <SortableHeader label={t("starfinder.paksha")} column={column} />,
      accessorFn: (row) => localizedName(row.paksha, "en"),
    },
  ]
}
