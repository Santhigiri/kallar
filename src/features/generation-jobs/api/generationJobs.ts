import { generationJobStatus } from "../schemas/generationJob"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

async function parseErrorDetail(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.detail === "string" ? body.detail : fallback
  } catch {
    return fallback
  }
}

// Finds the currently running job, if any — of any job type, since only one
// generation job runs at a time across the whole API. Lets a caller that
// hasn't started a job itself (e.g. a tab just opened, or a start request
// just got a 409) show that job's live progress instead of a static
// "already running" note.
export async function getActiveGenerationJob() {
  const response = await fetch(`${APP_BASE_URL}/api/v1/generation-jobs/active`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  })

  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 403) throw new ForbiddenError()
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to fetch active generation job"))
  }

  const json = await response.json()
  if (json === null) return null
  return generationJobStatus.parseAsync(json)
}

export async function getGenerationJob(jobId: string) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/generation-jobs/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }
  )

  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 403) throw new ForbiddenError()
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to fetch generation job"))
  }

  const json = await response.json()
  return generationJobStatus.parseAsync(json)
}
