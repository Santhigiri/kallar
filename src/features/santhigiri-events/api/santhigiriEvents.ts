import {
  santhigiriEventDetail,
  santhigiriEventGenerateProgress,
  santhigiriEventGenerateResult,
} from "../schemas/santhigiriEvent"
import type {
  SanthigiriEventFormValues,
  SanthigiriEventGenerateProgress,
  SanthigiriEventGenerateResult,
} from "../schemas/santhigiriEvent"
import { generationJobStarted, pollGenerationJob } from "@/lib/http/generationJob"
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

export class SanthigiriEventGenerationError extends Error {}

/** Start an occurrence-generation job for one event and poll it to
 * completion. The job runs on the server independent of this request/tab —
 * see `lib/http/generationJob.ts`. */
export async function generateSanthigiriEventOccurrences(
  eventId: string,
  startYear: number,
  endYear: number,
  onProgress?: (progress: SanthigiriEventGenerateProgress) => void
): Promise<SanthigiriEventGenerateResult> {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/panchangam/events/${encodeURIComponent(eventId)}/occurrences`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ start_year: startYear, end_year: endYear }),
    }
  )

  if (response.status === 409) {
    throw new SanthigiriEventGenerationError(
      "A data-generation job is already running. Wait for it to finish."
    )
  }
  await handleErrors(response)

  const { job_id } = generationJobStarted.parse(await response.json())
  return resumeSanthigiriEventOccurrences(job_id, onProgress)
}

/** Resume polling an already-started single-event occurrence job (e.g. one
 * found via `getActiveGenerationJob` after a reload). */
export function resumeSanthigiriEventOccurrences(
  jobId: string,
  onProgress?: (progress: SanthigiriEventGenerateProgress) => void
): Promise<SanthigiriEventGenerateResult> {
  return pollGenerationJob(
    jobId,
    santhigiriEventGenerateProgress,
    santhigiriEventGenerateResult,
    onProgress
  )
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
