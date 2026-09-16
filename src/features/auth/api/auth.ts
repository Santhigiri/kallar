import {
  profileResponse,
  resetTokenResponse,
  sessionTokenResponse,
  signupTokenResponse,
  tokenResponse,
} from "../schemas/auth"
import type { AuthTokens, Gender, Identifier, ProfileResponse } from "../schemas/auth"
import { authorizedFetch } from "@/lib/http/authorizedFetch"

const TVM_BASE_URL = import.meta.env.VITE_TVM_BASE_URL

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Incorrect email/phone or password")
    this.name = "InvalidCredentialsError"
  }
}

async function parseErrorDetail(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return typeof body.message === "string" ? body.message : fallback
  } catch {
    return fallback
  }
}

// login/complete-signup/refresh all share this response shape: the access
// token only ever arrives via the `Authorization` response header, the rest
// of the pair via the JSON body.
async function parseAuthTokens(response: Response): Promise<AuthTokens> {
  const accessToken = response.headers.get("Authorization")?.replace(/^Bearer /, "")
  if (!accessToken) {
    throw new Error("Missing Authorization header in TVM auth response")
  }
  const json = await response.json()
  const tokens = await tokenResponse.parseAsync(json.data)
  return { ...tokens, accessToken }
}

export async function sendVerification(identifier: Identifier): Promise<string> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/send-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(identifier),
  })
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to send verification code"))
  }
  const json = await response.json()
  return (await sessionTokenResponse.parseAsync(json.data)).sessionToken
}

export async function verifyCode(sessionToken: string, code: string): Promise<string> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ sessionToken, code }),
  })
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Invalid or expired code"))
  }
  const json = await response.json()
  return (await signupTokenResponse.parseAsync(json.data)).token
}

export async function completeSignup(
  signupToken: string,
  profile: {
    firstName: string
    lastName: string
    gender: Gender
    dob: string
    password: string
    isWhatsApp?: boolean
  }
): Promise<AuthTokens> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/complete-signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Signup ${signupToken}`,
    },
    body: JSON.stringify(profile),
  })
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to complete signup"))
  }
  return parseAuthTokens(response)
}

export async function login(identifier: Identifier, password: string): Promise<AuthTokens> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...identifier, password }),
  })
  if (response.status === 401) {
    throw new InvalidCredentialsError()
  }
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to log in"))
  }
  return parseAuthTokens(response)
}

export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${TVM_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
}

export async function forgotPassword(identifier: Identifier): Promise<void> {
  await fetch(`${TVM_BASE_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(identifier),
  })
  // Always resolves — TVM returns 200 regardless of whether the
  // identifier exists, to avoid leaking account existence.
}

export async function verifyResetCode(identifier: Identifier, code: string): Promise<string> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/verify-reset-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...identifier, code }),
  })
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Invalid or expired code"))
  }
  const json = await response.json()
  return (await resetTokenResponse.parseAsync(json.data)).resetToken
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<void> {
  const response = await fetch(`${TVM_BASE_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Reset ${resetToken}`,
    },
    body: JSON.stringify({ newPassword }),
  })
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Failed to reset password"))
  }
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await authorizedFetch(`${TVM_BASE_URL}/api/v1/profile`, {
    headers: { Accept: "application/json" },
  })
  if (!response.ok) {
    throw new Error("Failed to fetch profile")
  }
  const json = await response.json()
  return profileResponse.parseAsync(json.data)
}
