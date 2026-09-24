import { Pencil, Trash2 } from "lucide-react"
import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { Guruvani } from "@/features/guruvani/schemas/guruvani"
import { Button } from "@/components/ui/button"

type BuildColumnsArgs = {
  t: TFunction
  isAdmin: boolean
  onEdit: (entry: Guruvani) => void
  onDelete: (entry: Guruvani) => void
}

export function buildGuruvaniColumns({
  t,
  isAdmin,
  onEdit,
  onDelete,
}: BuildColumnsArgs): Array<ColumnDef<Guruvani>> {
  const columns: Array<ColumnDef<Guruvani>> = [
    {
      accessorKey: "text_en",
      header: ({ column }) => <SortableHeader label={t("common.english")} column={column} />,
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-md whitespace-pre-line">
          {row.original.text_en}
        </span>
      ),
    },
    {
      accessorKey: "text_ml",
      header: t("common.malayalam"),
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-md whitespace-pre-line">
          {row.original.text_ml}
        </span>
      ),
    },
    {
      accessorKey: "sort_order",
      header: ({ column }) => <SortableHeader label={t("dataAdmin.eventForm.sortOrder")} column={column} />,
    },
  ]

  if (isAdmin) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dataAdmin.columns.editGuruvani", { id: row.original.id })}
            onClick={() => onEdit(row.original)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dataAdmin.columns.deleteGuruvani", { id: row.original.id })}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    })
  }

  return columns
}
