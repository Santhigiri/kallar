import { CalendarPlus, Pencil, Trash2 } from "lucide-react"
import { SortableHeader } from "./SortableHeader"
import type { ColumnDef } from "@tanstack/react-table"
import type { SanthigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
import { Button } from "@/components/ui/button"

type BuildColumnsArgs = {
  canEdit: boolean
  onEdit: (event: SanthigiriEvent) => void
  onDelete: (event: SanthigiriEvent) => void
  onGenerateOccurrences: (event: SanthigiriEvent) => void
}

export function buildSanthigiriEventColumns({
  canEdit,
  onEdit,
  onDelete,
  onGenerateOccurrences,
}: BuildColumnsArgs): Array<ColumnDef<SanthigiriEvent>> {
  const columns: Array<ColumnDef<SanthigiriEvent>> = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader label="Name" column={column} />,
    },
    {
      accessorKey: "description",
      header: "Description",
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
            aria-label={`Generate occurrences for ${row.original.name}`}
            onClick={() => onGenerateOccurrences(row.original)}
          >
            <CalendarPlus />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.original.name}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.original.name}`}
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
