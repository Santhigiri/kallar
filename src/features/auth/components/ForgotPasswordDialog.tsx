import { useState } from "react"
import { toast } from "sonner"
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
import { IdentifierFields } from "@/features/auth/components/IdentifierFields"
import { forgotPassword, resetPassword, verifyResetCode } from "@/features/auth/api/auth"

type ForgotPasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "identifier" | "code" | "newPassword"

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<Step>("identifier")
  const [identifier, setIdentifier] = useState<Identifier>({ email: "" })
  const [code, setCode] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setStep("identifier")
    setIdentifier({ email: "" })
    setCode("")
    setResetToken("")
    setNewPassword("")
    setError(null)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  async function handleRequestReset(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await forgotPassword(identifier)
      setStep("code")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerifyCode(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      setResetToken(await verifyResetCode(identifier, code))
      setStep("newPassword")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await resetPassword(resetToken, newPassword)
      toast.success("Password reset — log in with your new password")
      resetAndClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
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
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {step === "identifier" && "Enter your email or phone to receive a reset code."}
            {step === "code" && "Enter the reset code we sent you."}
            {step === "newPassword" && "Choose a new password."}
          </DialogDescription>
        </DialogHeader>

        {step === "identifier" && (
          <form onSubmit={handleRequestReset}>
            <FieldGroup>
              <IdentifierFields
                identifier={identifier}
                onChange={setIdentifier}
                idPrefix="forgot-password"
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset code"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="forgot-password-code">Reset code</FieldLabel>
                <Input
                  id="forgot-password-code"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handleResetPassword}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="forgot-password-new-password">New password</FieldLabel>
                <Input
                  id="forgot-password-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
