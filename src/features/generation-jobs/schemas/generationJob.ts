import * as z from "zod"

// Read off the `X-Job-Id`/`X-Job-Type` headers of any `POST .../generate*`
// endpoint's streamed response, before its NDJSON body is read. The run
// keeps going even if the stream is lost — poll
// `/api/v1/generation-jobs/{job_id}` to pick progress back up.
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
  progress: z.record(z.string(), z.unknown()).nullable(),
  result: z.record(z.string(), z.unknown()).nullable(),
  error: z.string().nullable(),
  started_by: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type GenerationJobStatus = z.infer<typeof generationJobStatus>

// A loose shape covering the fields every job type's progress payload happens
// to share (`completed`/`total`/`percent`), for rendering progress on a job
// whose specific type (and therefore full progress schema) isn't known to the
// caller — e.g. a job of a different kind found running via `/active`.
export const genericGenerationProgress = z.object({
  completed: z.number().int(),
  total: z.number().int(),
  percent: z.number(),
})

export type GenericGenerationProgress = z.infer<typeof genericGenerationProgress>
