import * as z from "zod"
import { guruvani } from "../schemas/guruvani"
import { readGuruvaniOfTheDay, writeGuruvaniOfTheDay } from "./guruvaniCache"
import type { Guruvani, GuruvaniFormValues } from "../schemas/guruvani"
import { authorizedFetch } from "@/lib/http/authorizedFetch"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"
import { fetchWithEtag } from "@/lib/http/conditionalFetch"

const KUMILY_BASE_URL = import.meta.env.VITE_KUMILY_BASE_URL

export const GURUVANI_CACHE_KEY = "guruvani"

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
    throw new NotFoundError(await parseErrorDetail(response, "Guruvani not found"))
  }
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Request failed"))
  }
}

export function getGuruvanis(
  onBackgroundUpdate?: (data: Array<Guruvani>) => void
): Promise<Array<Guruvani>> {
  return fetchWithEtag(`${KUMILY_BASE_URL}/api/v1/guruvani`, GURUVANI_CACHE_KEY, z.array(guruvani), {
    handleErrors,
    onBackgroundUpdate,
  })
}

export async function getRandomGuruvani(): Promise<Guruvani> {
  const response = await fetch(`${KUMILY_BASE_URL}/api/v1/guruvani/random`, {
    headers: { Accept: "application/json" },
  })
  await handleErrors(response)
  const json = await response.json()
  return guruvani.parseAsync(json)
}

// Persists one random quote per calendar day so reloads don't swap it
// mid-day — a fresh quote is only picked once the caller passes a new day-key.
export async function getGuruvaniOfTheDay(dayKey: string): Promise<Guruvani> {
  const cached = await readGuruvaniOfTheDay(dayKey)
  if (cached) {
    try {
      return guruvani.parse(cached)
    } catch {
      // Cached payload no longer matches the schema — fall through to a fresh fetch.
    }
  }

  const data = await getRandomGuruvani()
  await writeGuruvaniOfTheDay(dayKey, data)
  return data
}

export async function createGuruvani(values: GuruvaniFormValues): Promise<Guruvani> {
  const response = await authorizedFetch(`${KUMILY_BASE_URL}/api/v1/guruvani`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(values),
  })
  await handleErrors(response)
  const json = await response.json()
  return guruvani.parseAsync(json)
}

export async function updateGuruvani(
  id: number,
  values: GuruvaniFormValues
): Promise<Guruvani> {
  const response = await authorizedFetch(`${KUMILY_BASE_URL}/api/v1/guruvani/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(values),
  })
  await handleErrors(response)
  const json = await response.json()
  return guruvani.parseAsync(json)
}

export async function deleteGuruvani(id: number): Promise<void> {
  const response = await authorizedFetch(`${KUMILY_BASE_URL}/api/v1/guruvani/${id}`, {
    method: "DELETE",
  })
  await handleErrors(response)
}
