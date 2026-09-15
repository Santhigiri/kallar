import { appSetting, appSettingList } from "../schemas/appSettings"
import type { AppSetting } from "../schemas/appSettings"
import { ForbiddenError, UnauthorizedError } from "@/lib/http/httpErrors"
import { fetchWithEtag } from "@/lib/http/conditionalFetch"
import { authorizedFetch } from "@/lib/http/authorizedFetch"
import { getAccessToken } from "@/lib/auth/tokenStore"

export const APP_SETTINGS_CACHE_KEY = "app-settings"

const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL

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
    throw new NotFoundError(await parseErrorDetail(response, "Setting not found"))
  }
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Request failed"))
  }
}

// Every /api/v1/settings endpoint requires the admin role, including reads
// (see panchangam-api's api/routes/v1/settings.py), so both attach the bearer
// access token. The list is now ETag-validated: fetchWithEtag hands back the
// cached value instantly (if any) and revalidates in the background via
// onBackgroundUpdate.
export function getAppSettings(
  onBackgroundUpdate?: (data: Array<AppSetting>) => void
): Promise<Array<AppSetting>> {
  const token = getAccessToken()
  return fetchWithEtag(`${APP_BASE_URL}/api/v1/settings`, APP_SETTINGS_CACHE_KEY, appSettingList, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    handleErrors,
    onBackgroundUpdate,
  })
}

export async function updateAppSetting(
  key: string,
  value: Record<string, unknown>
): Promise<AppSetting> {
  const response = await authorizedFetch(`${APP_BASE_URL}/api/v1/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ value }),
  })
  await handleErrors(response)
  const json = await response.json()
  return appSetting.parseAsync(json)
}
