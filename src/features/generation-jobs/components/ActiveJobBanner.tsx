import { jobTypeLabel } from "../lib/jobLabels"
import { genericGenerationProgress } from "../schemas/generationJob"
import type { GenerationJobStatus } from "../schemas/generationJob"
import { Progress } from "@/components/ui/progress"

type ActiveJobBannerProps = {
  job: GenerationJobStatus
}

// Shows live progress for a running job whose specific type (and therefore
// full progress schema) the caller doesn't know about — e.g. a different
// generation kind found running via `/generation-jobs/active`. Only the
// fields every job type's progress payload happens to share are rendered.
export function ActiveJobBanner({ job }: ActiveJobBannerProps) {
  const progress = genericGenerationProgress.safeParse(job.progress).data

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">
        {jobTypeLabel(job.job_type)} is already running
        {job.started_by ? ` (started by ${job.started_by})` : ""} — this must finish first.
      </span>
      {progress ? (
        <>
          <Progress value={progress.percent} />
          <span className="text-sm text-muted-foreground">
            {progress.completed}/{progress.total}
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Waiting for progress…</span>
      )}
    </div>
  )
}
