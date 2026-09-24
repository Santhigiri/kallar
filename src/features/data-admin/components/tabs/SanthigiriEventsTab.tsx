import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { EventFormDialog } from "../EventFormDialog"
import { GenerateOccurrencesDialog } from "../GenerateOccurrencesDialog"
import { buildSanthigiriEventColumns } from "../santhigiriEventColumns"
import type { SanthigiriEvent } from "@/features/santhigiri-events/schemas/santhigiriEvent"
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
import { useSanthigiriEventDetail } from "@/features/santhigiri-events/hooks/useSanthigiriEventDetail"
import { useSanthigiriEvents } from "@/features/panchangam/hooks/usePanchangamReference"
import {
  useCreateSanthigiriEvent,
  useDeleteSanthigiriEvent,
  useUpdateSanthigiriEvent,
} from "@/features/santhigiri-events/hooks/useSanthigiriEventMutations"
import { isAtLeast } from "@/lib/auth/roles"

export default function SanthigiriEventsTab() {
  const { t } = useTranslation()
  const { role } = useAuth()
  const isEditor = isAtLeast(role, "EDITOR")

  const { data, isLoading, isError } = useSanthigiriEvents()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<SanthigiriEvent | null>(null)
  const [generatingEvent, setGeneratingEvent] = useState<SanthigiriEvent | null>(null)

  const editingEventDetail = useSanthigiriEventDetail(editingId)
  const createMutation = useCreateSanthigiriEvent()
  const updateMutation = useUpdateSanthigiriEvent()
  const deleteMutation = useDeleteSanthigiriEvent()

  const columns = buildSanthigiriEventColumns({
    t,
    canEdit: isEditor,
    onEdit: (event) => setEditingId(event.id),
    onDelete: (event) => setDeletingEvent(event),
    onGenerateOccurrences: (event) => setGeneratingEvent(event),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dataAdmin.santhigiriEventsTab.title")}</CardTitle>
        {isEditor && (
          <CardAction>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus />
              {t("dataAdmin.santhigiriEventsTab.addEvent")}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
        {isError && (
          <p className="text-sm text-destructive">{t("dataAdmin.santhigiriEventsTab.loadError")}</p>
        )}
        {data && <DataTable columns={columns} data={data} />}
      </CardContent>

      <EventFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={(values) => createMutation.mutateAsync(values)}
      />

      <EventFormDialog
        open={editingId !== null && editingEventDetail.data !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditingId(null)
        }}
        event={editingEventDetail.data}
        onSubmit={({ id, ...values }) =>
          updateMutation.mutateAsync({ eventId: id, values })
        }
      />

      <GenerateOccurrencesDialog
        event={generatingEvent}
        onOpenChange={(open) => {
          if (!open) setGeneratingEvent(null)
        }}
      />

      <AlertDialog
        open={deletingEvent !== null}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dataAdmin.santhigiriEventsTab.deleteTitle", { name: deletingEvent?.name })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dataAdmin.santhigiriEventsTab.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingEvent) {
                  deleteMutation.mutate(deletingEvent.id)
                  setDeletingEvent(null)
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
