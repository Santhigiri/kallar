import { FieldsSettingCard } from "./FieldsSettingCard"
import { NakshatraStepDaysCard } from "./NakshatraStepDaysCard"
import TopAppBar from "@/components/shared/TopAppBar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAppSettings } from "@/features/settings/hooks/useAppSettings"
import { isAtLeast } from "@/lib/auth/roles"

export default function SettingsPage() {
  const { role } = useAuth()
  const isAdmin = isAtLeast(role, "ADMIN")

  // Every /api/v1/settings endpoint requires admin, including reads, so
  // there's nothing to fetch (or show) for anyone else.
  const { data, isLoading, isError } = useAppSettings(isAdmin)
  const settingsByKey = new Map((data ?? []).map((setting) => [setting.key, setting]))

  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title="Settings" />

      {!isAdmin ? (
        <p className="p-4 text-sm text-muted-foreground">
          Settings are only available to admins.
        </p>
      ) : (
        <div className="flex flex-col gap-4 p-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {isError && <p className="text-sm text-destructive">Failed to load settings.</p>}

          {!isLoading && !isError && (
            <>
              <FieldsSettingCard
                settingKey="seed_year_range"
                title="Seed year range"
                description="The inclusive year range the database is expected to have panchangam data seeded for. Drives the valid year bound on /panchangam/month and /panchangam/year."
                defaultValue={{ start_year: 2021, end_year: 2030 }}
                fields={[
                  { name: "start_year", label: "Start year", type: "int", min: 1 },
                  { name: "end_year", label: "End year", type: "int", min: 1 },
                ]}
                setting={settingsByKey.get("seed_year_range")}
              />

              <FieldsSettingCard
                settingKey="default_location_code"
                title="Default location"
                description="The location code served when a request omits ?location=."
                defaultValue={{ code: "tvm" }}
                fields={[{ name: "code", label: "Location code", type: "string" }]}
                setting={settingsByKey.get("default_location_code")}
              />

              <FieldsSettingCard
                settingKey="max_generate_span_days"
                title="Max generation span (days)"
                description="Shared cap on the size of a live-generation date range, for the panchangam and kollavarsham /generate endpoints."
                defaultValue={{ max_days: 366 }}
                fields={[{ name: "max_days", label: "Max days", type: "int", min: 1 }]}
                setting={settingsByKey.get("max_generate_span_days")}
              />

              <FieldsSettingCard
                settingKey="max_event_generate_year_span"
                title="Max event generation span (years)"
                description="Cap on the size of a Santhigiri event occurrence-generation year range."
                defaultValue={{ max_years: 15 }}
                fields={[{ name: "max_years", label: "Max years", type: "int", min: 1 }]}
                setting={settingsByKey.get("max_event_generate_year_span")}
              />

              <FieldsSettingCard
                settingKey="event_cutoffs"
                title="Event day-attribution cutoffs"
                description="The 7.5 Nazhika rule for last-occurrence events, and the 3-hour cutoff for nakshatra-transition-series events."
                defaultValue={{ nazhika_cutoff: 7.5, transition_hour_cutoff: 3.0 }}
                fields={[
                  { name: "nazhika_cutoff", label: "Nazhika cutoff", type: "float", min: 0, max: 60, step: 0.1 },
                  {
                    name: "transition_hour_cutoff",
                    label: "Transition hour cutoff",
                    type: "float",
                    min: 0,
                    max: 24,
                    step: 0.1,
                  },
                ]}
                setting={settingsByKey.get("event_cutoffs")}
              />

              <NakshatraStepDaysCard setting={settingsByKey.get("nakshatra_transition_step_days")} />

              <FieldsSettingCard
                settingKey="astronomy_epsilons"
                title="Astronomy epsilons"
                description="Small boundary-tie epsilons used by the discrete-transition search and the Kollavarsham raasi calculation. Fragile, correctness-critical internals — change with caution."
                defaultValue={{ nakshatra_epsilon: 1e-8, kollavarsham_epsilon: 1e-6 }}
                fields={[
                  { name: "nakshatra_epsilon", label: "Nakshatra epsilon", type: "float", step: "any" },
                  { name: "kollavarsham_epsilon", label: "Kollavarsham epsilon", type: "float", step: "any" },
                ]}
                setting={settingsByKey.get("astronomy_epsilons")}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
