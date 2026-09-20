import { z } from "zod"

// TVM's TokenResponse body. `refreshToken` is included for non-browser
// clients, but the browser never reads or stores it directly — TVM also sets
// it as an httpOnly, SameSite=Lax cookie (scoped to /api/v1/auth) on the same
// response, and that cookie is what the browser actually relies on for
// refresh/logout. Only `accessToken` is meant to be held client-side (in
// memory — see lib/auth/tokenStore.ts).
export const tokenResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  userId: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
})
export type TokenResponse = z.infer<typeof tokenResponse>

export type AuthTokens = Omit<TokenResponse, "refreshToken">

export const sessionTokenResponse = z.object({ sessionToken: z.string() })
export const signupTokenResponse = z.object({ token: z.string() })
export const resetTokenResponse = z.object({ resetToken: z.string() })

export const profileResponse = z.object({
  basic: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
})
export type ProfileResponse = z.infer<typeof profileResponse>

export const genderValues = ["MALE", "FEMALE", "OTHER"] as const
export type Gender = (typeof genderValues)[number]

// Every TVM endpoint that identifies a user by contact info accepts either shape.
export type Identifier =
  | { email: string }
  | { phoneCountryCode: string; phoneNo: number }
