// Mirrors TVM's Role enum / Chandiroor's authenticated tiers exactly
// (USER < EDITOR < ADMIN < SUPER_ADMIN < ROOT) — role claim values are
// uppercase, matching TVM's Kotlin enum member names.
const ROLE_ORDER = ["USER", "EDITOR", "ADMIN", "SUPER_ADMIN", "ROOT"] as const

export type Role = (typeof ROLE_ORDER)[number]

export function isAtLeast(role: string | null, minimum: Role): boolean {
  if (!role) return false
  const roleIndex = ROLE_ORDER.indexOf(role as Role)
  const minimumIndex = ROLE_ORDER.indexOf(minimum)
  return roleIndex !== -1 && roleIndex >= minimumIndex
}
