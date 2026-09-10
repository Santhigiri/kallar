import { generationJobStatus } from "../schemas/generationJob"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

// A `POST .../generate*` endpoint's job id/type are on the `X-Job-Id`/
// `X-Job-Type` response headers, sent before the NDJSON body starts — so a
// caller can start tracking the job immediately, without waiting on the
// stream (which may take a while, or never resolve if the connection drops).
export function jobStartedFromHeaders(response: Response): { job_id: string; job_type: string } {
  const job_id = response.headers.get("X-Job-Id")
  const job_type = response.headers.get("X-Job-Type")
  if (!job_id || !job_type) {
    throw new Error("Generation response is missing its X-Job-Id/X-Job-Type headers")
  }
  return { job_id, job_type }
}

// Reads a `application/x-ndjson` response body (one JSON object per line) and
// calls `onLine` for each complete line as it arrives, for live progress
// without waiting on the 4s job-status poll. This is a best-effort live view
// only: if the connection drops (e.g. the tab navigates away), reading just
// stops here — the job itself keeps running server-side and persists its
// progress into the job row regardless, so `useGenerationJobStatus`/
// `useActiveGenerationJob` remain the source of truth for resuming later.
export async function readNdjsonLines(
  response: Response,
  onLine: (line: string) => void
): Promise<void> {
  const body = response.body
  if (!body) return
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let newlineIndex = buffer.indexOf("\n")
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        if (line) onLine(line)
        newlineIndex = buffer.indexOf("\n")
      }
    }
    const rest = buffer.trim()
    if (rest) onLine(rest)
  } catch {
    // The connection dropped (navigation, network blip, tab closed) — stop
    // reading silently. The job itself is unaffected; it keeps running and
    // persisting progress server-side.
  } finally {
    reader.releaseLock()
  }
}

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
