import { setAccessToken } from "./tokenStore"

const TVM_BASE_URL = import.meta.env.VITE_TVM_BASE_URL

// The single implementation of "mint a fresh access token from the httpOnly
// refresh-token cookie". Used both on app load (useAuth's silent restore)
// and by authorizedFetch (a one-time retry after a 401) — kept here in
// lib/auth rather than features/auth/api so authorizedFetch (feature-agnostic
// infra) doesn't have to import a feature module. Parses TVM's response
// manually rather than pulling in features/auth's zod schemas for the same
// reason.
//
// The refresh token itself is never read or sent from JS: TVM's cookie is
// httpOnly, scoped to /api/v1/auth, and included automatically by the
// browser on this request via `credentials: "include"` (TVM's CORS config
// allows this origin with credentials). A missing/expired/already-rotated
// cookie just means the request comes back 401, same as any other failure
// case below.
let refreshInFlight: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    setAccessToken(null)
    return null
  }

  const json = await response.json()
  const accessToken = json?.data?.accessToken

  if (typeof accessToken !== "string") {
    setAccessToken(null)
    return null
  }

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
