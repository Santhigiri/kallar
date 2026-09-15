import { z } from "zod"

// TVM's TokenResponse body — note there is no `accessToken` field here. The
// access token is only ever returned via the `Authorization` response header
// (never the JSON body), so callers combine this with that header value.
export const tokenResponse = z.object({
  refreshToken: z.string(),
  userId: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
})
export type TokenResponse = z.infer<typeof tokenResponse>

export type AuthTokens = TokenResponse & { accessToken: string }

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
