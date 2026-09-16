import { clearRefreshToken, getRefreshToken, setRefreshToken } from "./refreshTokenCookie"
import { setAccessToken } from "./tokenStore"

const TVM_BASE_URL = import.meta.env.VITE_TVM_BASE_URL

// The single implementation of "mint a fresh access token from the stored
// refresh token". Used both on app load (useAuth's silent restore) and by
// authorizedFetch (a one-time retry after a 401) — kept here in lib/auth
// rather than features/auth/api so authorizedFetch (feature-agnostic infra)
// doesn't have to import a feature module. Parses TVM's response manually
// rather than pulling in features/auth's zod schemas for the same reason.
let refreshInFlight: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearRefreshToken()
    setAccessToken(null)
    return null
  }

  const accessToken = response.headers.get("Authorization")?.replace(/^Bearer /, "") ?? null
  const json = await response.json()
  const newRefreshToken = json?.data?.refreshToken

  if (!accessToken || typeof newRefreshToken !== "string") {
    clearRefreshToken()
    setAccessToken(null)
    return null
  }

  setRefreshToken(newRefreshToken)
  setAccessToken(accessToken)
  return accessToken
}

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}
