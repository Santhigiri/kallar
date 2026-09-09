import * as z from "zod"

// A background data-generation job started by one of the admin
// `/api/v1/panchangam/generate` / `/api/v1/panchangam/events/{id}/occurrences`
// / `/api/v1/panchangam/events/generate` endpoints. The job keeps running on
// the server even if the request that started it, or this tab, goes away —
// see the backend's `features/generation_jobs/` — so the frontend's role is
// just to poll `GET /api/v1/generation-jobs/{id}` until it settles. Only one
// job (of any kind) can be running at a time across the whole API; a second
// start attempt gets a 409.

export const generationJobStarted = z.object({
  job_id: z.string(),
  job_type: z.string(),
  status: z.string(),
})
export type GenerationJobStarted = z.infer<typeof generationJobStarted>

export const generationJobStatus = z.object({
  id: z.string(),
  job_type: z.string(),
  status: z.enum(["running", "succeeded", "failed"]),
  params: z.record(z.string(), z.unknown()),
  progress: z.record(z.string(), z.unknown()).nullable().optional(),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
  error: z.string().nullable().optional(),
  started_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type GenerationJobStatus = z.infer<typeof generationJobStatus>

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL
const DEFAULT_POLL_INTERVAL_MS = 1500

export class GenerationJobConflictError extends Error {}
export class GenerationJobFailedError extends Error {}

/** Fetch the currently running job (of any type), or null if none — lets a
 * page that just mounted (e.g. after a reload mid-run) find a job it lost
 * track of and resume showing its progress. */
export async function getActiveGenerationJob(): Promise<GenerationJobStatus | null> {
  const response = await fetch(`${APP_BASE_URL}/api/v1/generation-jobs/active`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  })
  if (!response.ok) throw new Error("Failed to check for an active generation job")
  const json = await response.json()
  return json === null ? null : generationJobStatus.parse(json)
}

async function fetchJobStatus(jobId: string): Promise<GenerationJobStatus> {
  const response = await fetch(`${APP_BASE_URL}/api/v1/generation-jobs/${jobId}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  })
  if (!response.ok) throw new Error("Failed to check generation job status")
  return generationJobStatus.parse(await response.json())
}

/** Poll *jobId* until it succeeds or fails, calling `onProgress` (parsed
 * with *progressSchema*) on every change and resolving with the final
 * result (parsed with *resultSchema*). Keeps polling across a page reload
 * as long as the caller re-obtains the same `jobId` (e.g. via
 * `getActiveGenerationJob`) — the job itself lives entirely server-side. */
export async function pollGenerationJob<TProgress, TResult>(
  jobId: string,
  progressSchema: z.ZodType<TProgress>,
  resultSchema: z.ZodType<TResult>,
  onProgress?: (progress: TProgress) => void
): Promise<TResult> {
  let lastProgress: unknown;
  for (;;) {
    const job = await fetchJobStatus(jobId)
    if (job.progress && job.progress !== lastProgress) {
      lastProgress = job.progress
      onProgress?.(progressSchema.parse(job.progress))
    }
    if (job.status === "succeeded") {
      return resultSchema.parse(job.result)
    }
    if (job.status === "failed") {
      throw new GenerationJobFailedError(job.error ?? "Generation job failed")
    }
    await new Promise((resolve) => setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS))
  }
}
