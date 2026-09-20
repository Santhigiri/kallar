import { toast } from "sonner"
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AuthTokens, Identifier } from "@/features/auth/schemas/auth"
import { getProfile, login as loginRequest, logout as logoutRequest } from "@/features/auth/api/auth"
import { decodeAccessToken } from "@/lib/auth/jwt"
import { refreshAccessToken } from "@/lib/auth/refreshAccessToken"
import { setAccessToken } from "@/lib/auth/tokenStore"
import { logger } from "@/lib/logger"

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
  // The refresh token lives in TVM's httpOnly cookie now, unreadable from
  // JS, so there's no way to know client-side whether a session exists
  // without asking the server. Always start by attempting a silent refresh;
  // a missing/expired cookie just resolves to "unauthenticated" below.
  const [status, setStatus] = useState<AuthStatus>("verifying")
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  async function applyTokens(tokens: AuthTokens) {
    const claims = decodeAccessToken(tokens.accessToken)
    if (!claims) {
      throw new Error("Received an unreadable access token")
    }
    setAccessToken(tokens.accessToken)
    setUserId(claims.userId)
    setRole(claims.role)
    try {
      const profile = await getProfile()
      setDisplayName(`${profile.basic.firstName} ${profile.basic.lastName}`.trim())
    } catch (error) {
      // Non-fatal — the session is still valid without a display name.
      logger.warn("auth", "profile fetch failed after auth, continuing without display name", error)
      setDisplayName(null)
    }
    setStatus("authenticated")
    logger.info("auth", `session established (role=${claims.role})`)
  }

  function clearSession() {
    setAccessToken(null)
    setUserId(null)
    setRole(null)
    setDisplayName(null)
    setStatus("unauthenticated")
    logger.debug("auth", "session cleared")
  }

  useEffect(() => {
    if (status !== "verifying") return

    let cancelled = false

    async function verify() {
      const accessToken = await refreshAccessToken()
      const claims = accessToken ? decodeAccessToken(accessToken) : null

      if (!claims) {
        logger.debug("auth", "session verification failed, treating as unauthenticated")
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
    try {
      const tokens = await loginRequest(identifier, password)
      await applyTokens(tokens)
      toast.success("Logged in")
    } catch (error) {
      logger.warn("auth", "login attempt failed", error)
      throw error
    }
  }

  async function applySignupTokens(tokens: AuthTokens) {
    await applyTokens(tokens)
    toast.success("Account created")
  }

  async function logout() {
    try {
      await logoutRequest()
    } catch (error) {
      logger.warn("auth", "server-side logout call failed", error)
      throw error
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
