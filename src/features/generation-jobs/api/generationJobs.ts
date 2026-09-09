import { generationJobStatus } from "../schemas/generationJob"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

async function parseErrorDetail(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.detail === "string" ? body.detail : fallback
  } catch {
    return fallback
  }
}

export async function getGenerationJob(jobId: string) {
  const response = await fetch(
    `${APP_BASE_URL}/api/v1/generation-jobs/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    }
  )

  if (response.status === 401) throw new UnauthorizedError()
  if (response.status === 403) throw new ForbiddenError()
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to fetch generation job"))
  }

  const json = await response.json()
  return generationJobStatus.parseAsync(json)
}
