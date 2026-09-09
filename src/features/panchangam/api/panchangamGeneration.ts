import { format } from "date-fns"
import * as z from "zod"
import { compactPanchangamData } from "../schemas/compactPanchangamData"
import { generationJobStarted } from "@/features/generation-jobs/schemas/generationJob"
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

// Starts a background generation job and returns immediately (202). Poll the
// returned job id via `useGenerationJobStatus` for progress and the result.
export async function startPanchangamGeneration(
  startDate: Date,
  endDate: Date,
  location: string
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
    throw new ConflictError(
      await parseErrorDetail(response, "A data-generation job is already running.")
    )
  }
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to start panchangam generation"))
  }

  const json = await response.json()
  return generationJobStarted.parseAsync(json)
}
