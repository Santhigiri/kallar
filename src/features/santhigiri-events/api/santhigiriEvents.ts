import { santhigiriEventDetail } from "../schemas/santhigiriEvent"
import type { SanthigiriEventFormValues,
  SanthigiriEventGenerateProgress,
  SanthigiriEventGenerateResult } from "../schemas/santhigiriEvent"
import { generationJobStarted } from "@/features/generation-jobs/schemas/generationJob"
import { jobStartedFromHeaders, readNdjsonLines } from "@/features/generation-jobs/api/generationJobs"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ConflictError"
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
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

async function handleErrors(response: Response) {
  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 403) throw new ForbiddenError()
  if (response.status === 404) {
    throw new NotFoundError(await parseErrorDetail(response, "Event not found"))
  }
  if (response.status === 409) {
    throw new ConflictError(await parseErrorDetail(response, "Event already exists"))
  }
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Request failed"))
  }
}

export async function createSanthigiriEvent(values: SanthigiriEventFormValues) {
  const response = await fetch(`${APP_BASE_URL}/api/v1/panchangam/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(values),
  })

  await handleErrors(response)
  const json = await response.json()
  return santhigiriEventDetail.parseAsync(json)
}

export async function updateSanthigiriEvent(
  eventId: string,
  values: Omit<SanthigiriEventFormValues, "id">
) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/events/${encodeURIComponent(eventId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    }
  )

  await handleErrors(response)
  const json = await response.json()
  return santhigiriEventDetail.parseAsync(json)
}

export async function deleteSanthigiriEvent(eventId: string) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  )

  await handleErrors(response)
}

export type SanthigiriEventGenerateStreamEvent =
  | SanthigiriEventGenerateProgress
  | SanthigiriEventGenerateResult
  | { type: "error"; detail: string }

// Starts an occurrence-generation job. The job's id/type are available as
// soon as the response headers arrive (before the body starts streaming);
// the run keeps going server-side even if this call's connection is later
// lost, so the caller should track the returned job id via
// `useGenerationJobStatus` regardless of whether it also passes `onEvent`.
//
// `onEvent`, if given, is called for each NDJSON progress/complete/error line
// as it streams in — see `startPanchangamGeneration` for the same pattern.
export async function startSanthigiriEventOccurrences(
  eventId: string,
  startYear: number,
  endYear: number,
  onEvent?: (event: SanthigiriEventGenerateStreamEvent) => void
) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/events/${encodeURIComponent(eventId)}/occurrences`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
      credentials: "include",
      body: JSON.stringify({ start_year: startYear, end_year: endYear }),
    }
  )

  await handleErrors(response)
  const started = await generationJobStarted.parseAsync({
    ...jobStartedFromHeaders(response),
    status: "running",
  })

  // Always drain the body, even without an `onEvent` listener — see
  // `startPanchangamGeneration` for why (backpressure on an unread stream
  // would otherwise stall the server's progress writes).
  void readNdjsonLines(response, (line) => {
    if (!onEvent) return
    try {
      onEvent(JSON.parse(line) as SanthigiriEventGenerateStreamEvent)
    } catch {
      // Ignore a malformed line rather than breaking the whole stream.
    }
  })

  return started
}

export async function getSanthigiriEvent(eventId: string) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/events/${encodeURIComponent(eventId)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  )

  await handleErrors(response)
  const json = await response.json()
  return santhigiriEventDetail.parseAsync(json)
}
