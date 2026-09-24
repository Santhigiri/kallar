import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { FormEvent } from "react"
import type { Identifier } from "@/features/auth/schemas/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { InvalidCredentialsError } from "@/features/auth/api/auth"
import { IdentifierFields } from "@/features/auth/components/IdentifierFields"

type LoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onForgotPassword: () => void
  onSignUp: () => void
}

export function LoginDialog({ open, onOpenChange, onForgotPassword, onSignUp }: LoginDialogProps) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState<Identifier>({ email: "" })
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setIdentifier({ email: "" })
    setPassword("")
    setError(null)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(identifier, password)
      resetAndClose()
    } catch (err) {
      setError(
        err instanceof InvalidCredentialsError ? err.message : t("common.somethingWentWrong")
      )
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          if (!next) resetAndClose()
          else onOpenChange(next)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth.login.title")}</DialogTitle>
          <DialogDescription>{t("auth.login.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <IdentifierFields identifier={identifier} onChange={setIdentifier} idPrefix="login" />
            <Field>
              <FieldLabel htmlFor="login-password">{t("auth.login.password")}</FieldLabel>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>
            <div className="flex justify-between">
              <Button type="button" variant="link" className="px-0" onClick={onForgotPassword}>
                {t("auth.login.forgotPassword")}
              </Button>
              <Button type="button" variant="link" className="px-0" onClick={onSignUp}>
                {t("auth.login.signUp")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
