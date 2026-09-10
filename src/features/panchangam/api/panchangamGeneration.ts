import { format } from "date-fns"
import * as z from "zod"
import { compactPanchangamData } from "../schemas/compactPanchangamData"
import type { PanchangamGenerateProgress, PanchangamGenerateResult } from "../schemas/compactPanchangamData"
import { generationJobStarted } from "@/features/generation-jobs/schemas/generationJob"
import { jobStartedFromHeaders, readNdjsonLines } from "@/features/generation-jobs/api/generationJobs"
import { fetchWithEtag } from "@/lib/http/conditionalFetch"
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

export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ConflictError"
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

export type PanchangamGenerateStreamEvent =
  | PanchangamGenerateProgress
  | PanchangamGenerateResult
  | { type: "error"; detail: string }

// Starts a generation job. The job's id/type are available as soon as the
// response headers arrive (before the body starts streaming); the run keeps
// going server-side even if this call's connection is later lost, so the
// caller should track the returned job id via `useGenerationJobStatus`
// regardless of whether it also passes `onEvent`.
//
// `onEvent`, if given, is called for each NDJSON progress/complete/error line
// as it streams in — a live view that's faster than the 4s job-status poll,
// but best-effort only: if the tab navigates away or the connection drops,
// these calls simply stop (see `readNdjsonLines`), and the caller falls back
// to polling for the final state.
export async function startPanchangamGeneration(
  startDate: Date,
  endDate: Date,
  location: string,
  onEvent?: (event: PanchangamGenerateStreamEvent) => void
) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/generate?location=${location}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
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
    throw new ConflictError(
      await parseErrorDetail(response, "A data-generation job is already running.")
    )
  }
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to start panchangam generation"))
  }

  const started = await generationJobStarted.parseAsync({
    ...jobStartedFromHeaders(response),
    status: "running",
  })

  // Always drain the body, even without an `onEvent` listener: the server
  // keeps writing progress lines as it works, and an unread response body
  // would eventually apply TCP backpressure and stall those writes.
  void readNdjsonLines(response, (line) => {
    if (!onEvent) return
    try {
      onEvent(JSON.parse(line) as PanchangamGenerateStreamEvent)
    } catch {
      // Ignore a malformed line rather than breaking the whole stream.
    }
  })

  return started
}
