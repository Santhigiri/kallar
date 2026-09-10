import { format } from "date-fns"
import * as z from "zod"
import { compactPanchangamData, panchangamGenerateLine } from "../schemas/compactPanchangamData"
import type { PanchangamGenerateProgress, panchangamGenerateResult } from "../schemas/compactPanchangamData"
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

export class PanchangamGenerationError extends Error {}

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
  if (!response.ok) {
    throw new Error("Failed to generate panchangam data")
  }
  if (!response.body) {
    throw new Error("Failed to generate panchangam data: empty response")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let result: z.infer<typeof panchangamGenerateResult> | undefined

  const handleLine = (line: string) => {
    if (!line.trim()) return
    const parsed = panchangamGenerateLine.parse(JSON.parse(line))
    if (parsed.type === "progress") {
      onProgress?.(parsed)
    } else if (parsed.type === "error") {
      throw new PanchangamGenerationError(parsed.detail)
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
    throw new Error("Panchangam generation stream ended without a result")
  }
  return result
}
