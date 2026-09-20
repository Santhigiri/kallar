import { useState } from "react"
import { Plus } from "lucide-react"
import { GuruvaniFormDialog } from "../GuruvaniFormDialog"
import { buildGuruvaniColumns } from "../guruvaniColumns"
import type { Guruvani } from "@/features/guruvani/schemas/guruvani"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useGuruvanis } from "@/features/guruvani/hooks/useGuruvani"
import { isAtLeast } from "@/lib/auth/roles"
import {
  useCreateGuruvani,
  useDeleteGuruvani,
  useUpdateGuruvani,
} from "@/features/guruvani/hooks/useGuruvaniMutations"

export default function GuruvaniTab() {
  const { role } = useAuth()
  const isAdmin = isAtLeast(role, "ADMIN")

  const { data, isLoading, isError } = useGuruvanis()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Guruvani | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<Guruvani | null>(null)

  const createMutation = useCreateGuruvani()
  const updateMutation = useUpdateGuruvani()
  const deleteMutation = useDeleteGuruvani()

  const columns = buildGuruvaniColumns({
    isAdmin,
    onEdit: (entry) => setEditingEntry(entry),
    onDelete: (entry) => setDeletingEntry(entry),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guruvani</CardTitle>
        {isAdmin && (
          <CardAction>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus />
              Add Guruvani
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {isError && <p className="text-sm text-destructive">Failed to load Guruvani.</p>}
        {data && <DataTable columns={columns} data={data} />}
      </CardContent>

      <GuruvaniFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => createMutation.mutateAsync(values)}
      />

      <GuruvaniFormDialog
        open={editingEntry !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEntry(null)
        }}
        entry={editingEntry ?? undefined}
        onSubmit={(values) => {
          if (!editingEntry) return Promise.resolve()
          return updateMutation.mutateAsync({ id: editingEntry.id, values })
        }}
      />

      <AlertDialog
        open={deletingEntry !== null}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Guruvani #{deletingEntry?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the Guruvani quote. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingEntry) {
                  deleteMutation.mutate(deletingEntry.id)
                  setDeletingEntry(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
