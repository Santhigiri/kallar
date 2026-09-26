import {
  santhigiriEventDetail,
  santhigiriEventGenerateLine,
} from "../schemas/santhigiriEvent"
import type {
  SanthigiriEventFormValues,
  SanthigiriEventGenerateProgress,
  SanthigiriEventGenerateResult,
} from "../schemas/santhigiriEvent"
import { authorizedFetch } from "@/lib/http/authorizedFetch"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"
import { envelope } from "@/lib/http/apiEnvelope"

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
    // v1 errors are {detail}; v2 errors are {success, message, data: {detail}}.
    const detail = body?.data?.detail ?? body?.detail
    return typeof detail === "string" ? detail : fallback
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
  const response = await authorizedFetch(`${APP_BASE_URL}/api/v2/panchangam/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(values),
  })

  await handleErrors(response)
  const json = await response.json()
  return envelope(santhigiriEventDetail).parseAsync(json)
}

export async function updateSanthigiriEvent(
  eventId: string,
  values: Omit<SanthigiriEventFormValues, "id">
) {
  const response = await authorizedFetch(
    `${APP_BASE_URL}/api/v2/panchangam/events/${encodeURIComponent(eventId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(values),
    }
  )

  await handleErrors(response)
  const json = await response.json()
  return envelope(santhigiriEventDetail).parseAsync(json)
}

export async function deleteSanthigiriEvent(eventId: string) {
  const response = await authorizedFetch(
    `${APP_BASE_URL}/api/v2/panchangam/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
    }
  )

  await handleErrors(response)
}

export class SanthigiriEventGenerationError extends Error {}

export async function generateSanthigiriEventOccurrences(
  eventId: string,
  startYear: number,
  endYear: number,
  onProgress?: (progress: SanthigiriEventGenerateProgress) => void
): Promise<SanthigiriEventGenerateResult> {
  const response = await authorizedFetch(
    `${APP_BASE_URL}/api/v1/panchangam/events/${encodeURIComponent(eventId)}/occurrences/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
      body: JSON.stringify({ start_year: startYear, end_year: endYear }),
    }
  )

  await handleErrors(response)
  if (!response.body) {
    throw new Error("Failed to generate occurrences: empty response")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let result: SanthigiriEventGenerateResult | undefined

  const handleLine = (line: string) => {
    if (!line.trim()) return
    const parsed = santhigiriEventGenerateLine.parse(JSON.parse(line))
    if (parsed.type === "progress") {
      onProgress?.(parsed)
    } else if (parsed.type === "error") {
      throw new SanthigiriEventGenerationError(parsed.detail)
    } else {
      result = parsed
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      handleLine(line)
    }
  }
  buffer += decoder.decode()
  handleLine(buffer)

  if (!result) {
    throw new Error("Occurrence generation stream ended without a result")
  }
  return result
}

export function getSanthigiriEventsCalendarIcsUrl() {
  return `${APP_BASE_URL}/api/v1/panchangam/events/calendar.ics`
}

export async function downloadSanthigiriEventsCalendarIcs() {
  const response = await fetch(getSanthigiriEventsCalendarIcsUrl(), {
    method: "GET",
    headers: { Accept: "text/calendar" },
  })

  await handleErrors(response)
  return response.blob()
}

export async function getSanthigiriEvent(eventId: string) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v2/panchangam/events/${encodeURIComponent(eventId)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  )

  await handleErrors(response)
  const json = await response.json()
  return envelope(santhigiriEventDetail).parseAsync(json)
}
