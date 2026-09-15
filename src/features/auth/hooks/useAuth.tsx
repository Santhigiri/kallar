import { toast } from "sonner"
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AuthTokens, Identifier } from "@/features/auth/schemas/auth"
import { getProfile, login as loginRequest, logout as logoutRequest } from "@/features/auth/api/auth"
import { decodeAccessToken } from "@/lib/auth/jwt"
import { refreshAccessToken } from "@/lib/auth/refreshAccessToken"
import { clearRefreshToken, getRefreshToken, setRefreshToken } from "@/lib/auth/refreshTokenCookie"
import { setAccessToken } from "@/lib/auth/tokenStore"

type AuthStatus = "verifying" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  userId: string | null
  role: string | null
  displayName: string | null
  isAuthenticated: boolean
  isVerifying: boolean
  login: (identifier: Identifier, password: string) => Promise<void>
  applySignupTokens: (tokens: AuthTokens) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getRefreshToken() ? "verifying" : "unauthenticated"
  )
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  async function applyTokens(tokens: AuthTokens) {
    const claims = decodeAccessToken(tokens.accessToken)
    if (!claims) {
      throw new Error("Received an unreadable access token")
    }
    setRefreshToken(tokens.refreshToken)
    setAccessToken(tokens.accessToken)
    setUserId(claims.userId)
    setRole(claims.role)
    try {
      const profile = await getProfile()
      setDisplayName(`${profile.basic.firstName} ${profile.basic.lastName}`.trim())
    } catch {
      // Non-fatal — the session is still valid without a display name.
      setDisplayName(null)
    }
    setStatus("authenticated")
  }

  function clearSession() {
    clearRefreshToken()
    setAccessToken(null)
    setUserId(null)
    setRole(null)
    setDisplayName(null)
    setStatus("unauthenticated")
  }

  useEffect(() => {
    if (status !== "verifying") return

    let cancelled = false

    async function verify() {
      const accessToken = await refreshAccessToken()
      const claims = accessToken ? decodeAccessToken(accessToken) : null

      if (!claims) {
        if (!cancelled) clearSession()
        return
      }

      const name = await getProfile()
        .then((profile) => `${profile.basic.firstName} ${profile.basic.lastName}`.trim())
        .catch(() => null)

      if (cancelled) return
      setUserId(claims.userId)
      setRole(claims.role)
      setDisplayName(name)
      setStatus("authenticated")
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [status])

  async function login(identifier: Identifier, password: string) {
    const tokens = await loginRequest(identifier, password)
    await applyTokens(tokens)
    toast.success("Logged in")
  }

  async function applySignupTokens(tokens: AuthTokens) {
    await applyTokens(tokens)
    toast.success("Account created")
  }

  async function logout() {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await logoutRequest(refreshToken)
    } finally {
      clearSession()
      toast.success("Logged out")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        role,
        displayName,
        isAuthenticated: status === "authenticated",
        isVerifying: status === "verifying",
        login,
        applySignupTokens,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
