import { santhigiriEventDetail } from "../schemas/santhigiriEvent"
import type { SanthigiriEventFormValues } from "../schemas/santhigiriEvent"
import { generationJobStarted } from "@/features/generation-jobs/schemas/generationJob"
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

// Starts a background occurrence-generation job and returns immediately
// (202). Poll the returned job id via `useGenerationJobStatus` for progress
// and the result.
export async function startSanthigiriEventOccurrences(
  eventId: string,
  startYear: number,
  endYear: number
) {
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

  await handleErrors(response)
  const json = await response.json()
  return generationJobStarted.parseAsync(json)
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
