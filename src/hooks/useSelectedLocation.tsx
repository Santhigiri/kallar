import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

// The location code the app used before a picker existed — kept as the
// default so existing users see no change until they pick somewhere else.
const DEFAULT_LOCATION_CODE = "tvm"
const STORAGE_KEY = "panchangam.location-code"

function readStoredLocationCode(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCATION_CODE
  } catch {
    // Private browsing / storage disabled — fall back to the default.
    return DEFAULT_LOCATION_CODE
  }
}

type SelectedLocationContextValue = {
  locationCode: string
  setLocationCode: (code: string) => void
}

const SelectedLocationContext = createContext<SelectedLocationContextValue | null>(null)

export function SelectedLocationProvider({ children }: { children: ReactNode }) {
  const [locationCode, setLocationCodeState] = useState(readStoredLocationCode)

  const value = useMemo(
    () => ({
      locationCode,
      setLocationCode: (code: string) => {
        setLocationCodeState(code)
        try {
          localStorage.setItem(STORAGE_KEY, code)
        } catch {
          // Best-effort persistence — a failed write just resets to the
          // default on next load, which is harmless.
        }
      },
    }),
    [locationCode]
  )

  return (
    <SelectedLocationContext.Provider value={value}>{children}</SelectedLocationContext.Provider>
  )
}

export function useSelectedLocation() {
  const context = useContext(SelectedLocationContext)
  if (!context) {
    throw new Error("useSelectedLocation must be used within a SelectedLocationProvider")
  }
  return context
}
