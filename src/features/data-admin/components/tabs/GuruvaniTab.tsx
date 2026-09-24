import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
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
    t,
    isAdmin,
    onEdit: (entry) => setEditingEntry(entry),
    onDelete: (entry) => setDeletingEntry(entry),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dayDetails.guruvani.title")}</CardTitle>
        {isAdmin && (
          <CardAction>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus />
              {t("dataAdmin.guruvaniTab.add")}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
        {isError && <p className="text-sm text-destructive">{t("dataAdmin.guruvaniTab.loadError")}</p>}
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
            <AlertDialogTitle>
              {t("dataAdmin.guruvaniTab.deleteTitle", { id: deletingEntry?.id })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dataAdmin.guruvaniTab.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingEntry) {
                  deleteMutation.mutate(deletingEntry.id)
                  setDeletingEntry(null)
                }
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
