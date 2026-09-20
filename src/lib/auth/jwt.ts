// TVM's access-token JWT payload carries userId/role/isVerified claims
// directly (see tvm's shared/services/TokenService.kt), so the UI can read
// them client-side with no extra network call. This never verifies the
// signature — it's for UI gating only; Chandiroor is the one that verifies
// the token against TVM's JWKS on every request.
export type AccessTokenClaims = {
  userId: string
  role: string
  isVerified: boolean
  exp: number
}

// TVM's JWT userId claim is a raw int (see tvm's TokenService.kt), not a
// string — normalize it here rather than changing the claim type, since
// TVM's own validateToken() also reads it as an int.
function normalizeUserId(value: unknown): string | null {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return null
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(segment.length / 4) * 4, "=")
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  )
}

export function decodeAccessToken(token: string): AccessTokenClaims | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    const userId = normalizeUserId(payload.userId)
    if (
      userId === null ||
      typeof payload.role !== "string" ||
      typeof payload.isVerified !== "boolean" ||
      typeof payload.exp !== "number"
    ) {
      return null
    }
    return { ...payload, userId } as AccessTokenClaims
  } catch {
    return null
  }
}
