import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { Thithi } from "@/features/panchangam/schemas/panchangamData"

export function buildThithiColumns(t: TFunction): Array<ColumnDef<Thithi>> {
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
    {
      id: "paksha",
      header: ({ column }) => <SortableHeader label={t("starfinder.paksha")} column={column} />,
      accessorFn: (row) => row.paksha.en,
    },
  ]
}
