// TVM issues refresh tokens (90-day lifetime) as a bare string in the JSON
// body — there's no server-set cookie (TVM's code isn't being changed beyond
// its CORS config). So Kallar sets a plain, JS-readable cookie itself and
// attaches it manually as a header on refresh calls; it carries no more (and
// no less) exposure to XSS than localStorage would.
const COOKIE_NAME = "panchangam.refresh_token"
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60

export function getRefreshToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setRefreshToken(token: string): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`
}

export function clearRefreshToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}
