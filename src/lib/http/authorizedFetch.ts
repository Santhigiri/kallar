import { getAccessToken } from "@/lib/auth/tokenStore"
import { refreshAccessToken } from "@/lib/auth/refreshAccessToken"

function withAuthHeader(init: RequestInit, token: string | null): RequestInit {
  if (!token) return init
  return { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } }
}

// Drop-in replacement for `fetch` on requests that used to rely on
// `credentials: "include"` session cookies. Attaches the current access
// token and, on a 401 (likely just an expired 1h access token), makes one
// silent attempt to mint a fresh one from the refresh token before retrying.
// The final response — 401 included, if the retry also fails — is handed
// back unchanged for the caller's own error handling.
export async function authorizedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  const response = await fetch(url, withAuthHeader(init, token))
  if (response.status !== 401) return response

  const newToken = await refreshAccessToken()
  if (!newToken) return response

  return fetch(url, withAuthHeader(init, newToken))
}
