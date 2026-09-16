// The TVM access token (1h lifetime) is never persisted — it lives only in
// this in-memory singleton so plain (non-React) API modules can read it
// without prop-drilling. It's re-minted from the refresh-token cookie
// (see refreshTokenCookie.ts) on every page load via refreshAccessToken().
let accessToken: string | null = null
const listeners = new Set<(token: string | null) => void>()

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  for (const listener of listeners) listener(token)
}

export function subscribeToAccessToken(listener: (token: string | null) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
