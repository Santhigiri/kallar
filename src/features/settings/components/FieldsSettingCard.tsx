import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { SettingCard } from "./SettingCard"
import type { AppSetting } from "@/features/settings/schemas/appSettings"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useUpdateAppSetting } from "@/features/settings/hooks/useAppSettings"

type FieldType = "int" | "float" | "string"

export type SettingFieldConfig = {
  name: string
  label: string
  type: FieldType
  min?: number
  max?: number
  step?: number | "any"
}

type FieldsSettingCardProps = {
  settingKey: string
  title: string
  description: string
  defaultValue: Record<string, unknown>
  fields: Array<SettingFieldConfig>
  setting?: AppSetting
}

function toFormState(
  value: Record<string, unknown>,
  fields: Array<SettingFieldConfig>
): Record<string, string> {
  const form: Record<string, string> = {}
  for (const field of fields) {
    const raw = value[field.name]
    form[field.name] = raw === undefined || raw === null ? "" : String(raw)
  }
  return form
}

/** A card for a setting whose value is a flat object of number/string fields
 * (every key except nakshatra_transition_step_days, whose overrides map
 * needs a dedicated editor — see NakshatraStepDaysCard). */
export function FieldsSettingCard({
  settingKey,
  title,
  description,
  defaultValue,
  fields,
  setting,
}: FieldsSettingCardProps) {
  const { t } = useTranslation()
  const value = setting?.value ?? defaultValue
  const initialForm = toFormState(value, fields)
  const [form, setForm] = useState<Record<string, string>>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const updateMutation = useUpdateAppSetting()

  // Re-sync only when this setting's own row actually changes (our save, or
  // another admin's), not on every incidental refetch of the list.
  useEffect(() => {
    setForm(toFormState(value, fields))
    setError(null)
  }, [setting?.updated_at])

  const isDirty = fields.some((field) => form[field.name] !== initialForm[field.name])

  function handleReset() {
    setForm(initialForm)
    setError(null)
  }

  async function handleSave() {
    setError(null)
    const payload: Record<string, unknown> = {}
    for (const field of fields) {
      const raw = form[field.name]
      if (field.type === "string") {
        payload[field.name] = raw.trim()
        continue
      }
      const parsed = field.type === "int" ? Number.parseInt(raw, 10) : Number.parseFloat(raw)
      if (Number.isNaN(parsed)) {
        setError(t("settings.fieldMustBeNumber", { label: field.label }))
        return
      }
      payload[field.name] = parsed
    }
    try {
      await updateMutation.mutateAsync({ key: settingKey, value: payload })
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.saveFailed"))
    }
  }

  return (
    <SettingCard
      title={title}
      description={description}
      isDirty={isDirty}
      isSaving={updateMutation.isPending}
      error={error}
      updatedAt={setting?.updated_at}
      updatedBy={setting?.updated_by}
      onSave={handleSave}
      onReset={handleReset}
    >
      <div className={fields.length > 1 ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : undefined}>
        {fields.map((field) => (
          <Field key={field.name}>
            <FieldLabel htmlFor={`${settingKey}-${field.name}`}>{field.label}</FieldLabel>
            <Input
              id={`${settingKey}-${field.name}`}
              type={field.type === "string" ? "text" : "number"}
              min={field.min}
              max={field.max}
              step={field.step ?? (field.type === "int" ? 1 : "any")}
              value={form[field.name]}
              onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
    </SettingCard>
  )
}
