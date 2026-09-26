import { z } from "zod"

// Mirrors utils.settings_keys.SettingKey in panchangam-api.
export const settingKey = z.enum([
  "seed_year_range",
  "default_location_code",
  "max_generate_span_days",
  "max_event_generate_year_span",
  "event_cutoffs",
  "nakshatra_transition_step_days",
  "astronomy_epsilons",
])
export type SettingKey = z.infer<typeof settingKey>

// Generic envelope returned by GET/PUT /api/v2/settings — mirrors
// schemas.app_setting.AppSettingRead. `value`'s shape depends on `key`; the
// per-key models below (mirroring schemas/app_setting.py) are used by
// individual setting cards to interpret it.
export const appSetting = z.object({
  key: z.string(),
  value: z.record(z.string(), z.unknown()),
  description: z.string().nullable(),
  updated_at: z.string(),
  updated_by: z.string().nullable(),
})
export type AppSetting = z.infer<typeof appSetting>

export const appSettingList = z.array(appSetting)

export const nakshatraStepDaysValue = z.object({
  default: z.number(),
  overrides: z.record(z.string(), z.number()),
})
export type NakshatraStepDaysValue = z.infer<typeof nakshatraStepDaysValue>
