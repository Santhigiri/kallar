import { CalendarPlus, Pencil, Trash2 } from "lucide-react"
import { SortableHeader } from "./SortableHeader"
import type { TFunction } from "i18next"
import type { ColumnDef } from "@tanstack/react-table"
import type { SanthigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import { Button } from "@/components/ui/button"

type BuildColumnsArgs = {
  t: TFunction
  canEdit: boolean
  onEdit: (event: SanthigiriEvent) => void
  onDelete: (event: SanthigiriEvent) => void
  onGenerateOccurrences: (event: SanthigiriEvent) => void
}

export function buildSanthigiriEventColumns({
  t,
  canEdit,
  onEdit,
  onDelete,
  onGenerateOccurrences,
}: BuildColumnsArgs): Array<ColumnDef<SanthigiriEvent>> {
  const columns: Array<ColumnDef<SanthigiriEvent>> = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader label={t("common.name")} column={column} />,
    },
    {
      accessorKey: "description",
      header: t("common.description"),
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-md whitespace-pre-line">
          {row.original.description.trim()}
        </span>
      ),
    },
  ]

  if (canEdit) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dataAdmin.columns.generateOccurrencesFor", { name: row.original.name })}
            onClick={() => onGenerateOccurrences(row.original)}
          >
            <CalendarPlus />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dataAdmin.columns.editName", { name: row.original.name })}
            onClick={() => onEdit(row.original)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("dataAdmin.columns.deleteName", { name: row.original.name })}
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
