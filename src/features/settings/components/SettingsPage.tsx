import { useTranslation } from "react-i18next"
import { FieldsSettingCard } from "./FieldsSettingCard"
import { NakshatraStepDaysCard } from "./NakshatraStepDaysCard"
import TopAppBar from "@/components/shared/TopAppBar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAppSettings } from "@/features/settings/hooks/useAppSettings"
import { isAtLeast } from "@/lib/auth/roles"

export default function SettingsPage() {
  const { t } = useTranslation()
  const { role } = useAuth()
  const isAdmin = isAtLeast(role, "ADMIN")

  // Every /api/v2/settings endpoint requires admin, including reads, so
  // there's nothing to fetch (or show) for anyone else.
  const { data, isLoading, isError } = useAppSettings(isAdmin)
  const settingsByKey = new Map((data ?? []).map((setting) => [setting.key, setting]))

  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title={t("nav.settings")} />

      {!isAdmin ? (
        <p className="p-4 text-sm text-muted-foreground">{t("settings.adminOnly")}</p>
      ) : (
        <div className="flex flex-col gap-4 p-2">
          {isLoading && <p className="text-sm text-muted-foreground">{t("settings.loading")}</p>}
          {isError && <p className="text-sm text-destructive">{t("settings.loadError")}</p>}

          {!isLoading && !isError && (
            <>
              <FieldsSettingCard
                settingKey="seed_year_range"
                title={t("settings.seedYearRange.title")}
                description={t("settings.seedYearRange.description")}
                defaultValue={{ start_year: 2021, end_year: 2030 }}
                fields={[
                  { name: "start_year", label: t("settings.seedYearRange.startYear"), type: "int", min: 1 },
                  { name: "end_year", label: t("settings.seedYearRange.endYear"), type: "int", min: 1 },
                ]}
                setting={settingsByKey.get("seed_year_range")}
              />

              <FieldsSettingCard
                settingKey="default_location_code"
                title={t("settings.defaultLocation.title")}
                description={t("settings.defaultLocation.description")}
                defaultValue={{ code: "tvm" }}
                fields={[{ name: "code", label: t("settings.defaultLocation.code"), type: "string" }]}
                setting={settingsByKey.get("default_location_code")}
              />

              <FieldsSettingCard
                settingKey="max_generate_span_days"
                title={t("settings.maxGenerateSpan.title")}
                description={t("settings.maxGenerateSpan.description")}
                defaultValue={{ max_days: 366 }}
                fields={[{ name: "max_days", label: t("settings.maxGenerateSpan.maxDays"), type: "int", min: 1 }]}
                setting={settingsByKey.get("max_generate_span_days")}
              />

              <FieldsSettingCard
                settingKey="max_event_generate_year_span"
                title={t("settings.maxEventGenerateSpan.title")}
                description={t("settings.maxEventGenerateSpan.description")}
                defaultValue={{ max_years: 15 }}
                fields={[{ name: "max_years", label: t("settings.maxEventGenerateSpan.maxYears"), type: "int", min: 1 }]}
                setting={settingsByKey.get("max_event_generate_year_span")}
              />

              <FieldsSettingCard
                settingKey="event_cutoffs"
                title={t("settings.eventCutoffs.title")}
                description={t("settings.eventCutoffs.description")}
                defaultValue={{ nazhika_cutoff: 7.5, transition_hour_cutoff: 3.0 }}
                fields={[
                  {
                    name: "nazhika_cutoff",
                    label: t("settings.eventCutoffs.nazhikaCutoff"),
                    type: "float",
                    min: 0,
                    max: 60,
                    step: 0.1,
                  },
                  {
                    name: "transition_hour_cutoff",
                    label: t("settings.eventCutoffs.transitionHourCutoff"),
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
                title={t("settings.astronomyEpsilons.title")}
                description={t("settings.astronomyEpsilons.description")}
                defaultValue={{ nakshatra_epsilon: 1e-8, kollavarsham_epsilon: 1e-6 }}
                fields={[
                  {
                    name: "nakshatra_epsilon",
                    label: t("settings.astronomyEpsilons.nakshatraEpsilon"),
                    type: "float",
                    step: "any",
                  },
                  {
                    name: "kollavarsham_epsilon",
                    label: t("settings.astronomyEpsilons.kollavarshamEpsilon"),
                    type: "float",
                    step: "any",
                  },
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
