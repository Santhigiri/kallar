import * as z from "zod"

// Returned immediately (202) by any `POST .../generate*` endpoint. The run
// itself continues in the background — poll `/api/v1/generation-jobs/{job_id}`.
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
