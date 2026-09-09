import { format } from "date-fns"
import * as z from "zod"
import {
  compactPanchangamData,
  panchangamGenerateProgress,
  panchangamGenerateResult,
} from "../schemas/compactPanchangamData"
import type { PanchangamGenerateProgress } from "../schemas/compactPanchangamData"
import { fetchWithEtag } from "@/lib/http/conditionalFetch"
import { generationJobStarted, pollGenerationJob } from "@/lib/http/generationJob"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"

const compactPanchangamMonth = z.record(z.string(), compactPanchangamData)
export type CompactPanchangamMonth = z.infer<typeof compactPanchangamMonth>

const compactPanchangamYear = z.record(z.string(), compactPanchangamData)
export type CompactPanchangamYear = z.infer<typeof compactPanchangamYear>

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export async function getPanchangamMonth(year: number, month: number, location: string): Promise<CompactPanchangamMonth> {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/month?year=${year}&month=${month}&location=${location}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch panchangam for ${year}-${month}`)
  }

  const json = await response.json()
  return compactPanchangamMonth.parseAsync(json)
}

export function getPanchangamYear(
  year: number,
  location: string,
  onBackgroundUpdate?: (data: CompactPanchangamYear) => void
): Promise<CompactPanchangamYear> {
  return fetchWithEtag(
    `${APP_BASE_URL}/api/v1/panchangam/year?year=${year}&location=${location}`,
    `year:${location}:${year}`,
    compactPanchangamYear,
    { onBackgroundUpdate }
  )
}

export class PanchangamGenerationError extends Error {}

/** Start a panchangam-generation job and poll it to completion. The job runs
 * on the server independent of this request/tab, so it keeps going (and can
 * be resumed via `getActiveGenerationJob`) even if this call is abandoned —
 * see `lib/http/generationJob.ts`. */
export async function generatePanchangam(
  startDate: Date,
  endDate: Date,
  location: string,
  onProgress?: (progress: PanchangamGenerateProgress) => void
) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/generate?location=${location}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        start_date: dateKey(startDate),
        end_date: dateKey(endDate),
      }),
    }
  )

  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 403) throw new ForbiddenError()
  if (response.status === 409) {
    throw new PanchangamGenerationError(
      "A data-generation job is already running. Wait for it to finish."
    )
  }
  if (!response.ok) {
    throw new Error("Failed to start panchangam generation")
  }

  const { job_id } = generationJobStarted.parse(await response.json())
  return resumePanchangamGeneration(job_id, onProgress)
}

/** Resume polling an already-started job (e.g. one found via
 * `getActiveGenerationJob` after a reload). */
export function resumePanchangamGeneration(
  jobId: string,
  onProgress?: (progress: PanchangamGenerateProgress) => void
): Promise<z.infer<typeof panchangamGenerateResult>> {
  return pollGenerationJob(jobId, panchangamGenerateProgress, panchangamGenerateResult, onProgress)
}
