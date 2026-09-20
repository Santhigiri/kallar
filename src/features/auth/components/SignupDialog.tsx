import { useState } from "react"
import type { FormEvent } from "react"
import type { Gender, Identifier } from "@/features/auth/schemas/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { IdentifierFields } from "@/features/auth/components/IdentifierFields"
import { completeSignup, sendVerification, verifyCode } from "@/features/auth/api/auth"
import { genderValues } from "@/features/auth/schemas/auth"

type SignupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "identifier" | "code" | "profile"

export function SignupDialog({ open, onOpenChange }: SignupDialogProps) {
  const { applySignupTokens } = useAuth()
  const [step, setStep] = useState<Step>("identifier")
  const [identifier, setIdentifier] = useState<Identifier>({ email: "" })
  const [sessionToken, setSessionToken] = useState("")
  const [code, setCode] = useState("")
  const [signupToken, setSignupToken] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [gender, setGender] = useState<Gender>("MALE")
  const [dob, setDob] = useState("")
  const [password, setPassword] = useState("")
  const [isWhatsApp, setIsWhatsApp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetAndClose() {
    setStep("identifier")
    setIdentifier({ email: "" })
    setSessionToken("")
    setCode("")
    setSignupToken("")
    setFirstName("")
    setLastName("")
    setGender("MALE")
    setDob("")
    setPassword("")
    setIsWhatsApp(false)
    setError(null)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  async function handleSendCode(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      setSessionToken(await sendVerification(identifier))
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerifyCode(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      setSignupToken(await verifyCode(sessionToken, code))
      setStep("profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCompleteSignup(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const tokens = await completeSignup(signupToken, {
        firstName,
        lastName,
        gender,
        dob,
        password,
        isWhatsApp: "phoneCountryCode" in identifier ? isWhatsApp : undefined,
      })
      await applySignupTokens(tokens)
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
          <DialogTitle>Sign up</DialogTitle>
          <DialogDescription>
            {step === "identifier" && "Enter your email to get started."}
            {step === "code" && "Enter the verification code we sent you."}
            {step === "profile" && "Tell us a bit about yourself."}
          </DialogDescription>
        </DialogHeader>

        {step === "identifier" && (
          <form onSubmit={handleSendCode}>
            <FieldGroup>
              <IdentifierFields identifier={identifier} onChange={setIdentifier} idPrefix="signup" />
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending code..." : "Send verification code"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-code">Verification code</FieldLabel>
                <Input
                  id="signup-code"
                  autoComplete="one-time-code"
                  data-1p-ignore
                  data-lpignore="true"
                  data-bwignore
                  data-form-type="other"
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

        {step === "profile" && (
          <form onSubmit={handleCompleteSignup}>
            <FieldGroup>
              <div className="flex gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor="signup-first-name">First name</FieldLabel>
                  <Input
                    id="signup-first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoFocus
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel htmlFor="signup-last-name">Last name</FieldLabel>
                  <Input
                    id="signup-last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="signup-gender">Gender</FieldLabel>
                <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                  <SelectTrigger id="signup-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.charAt(0) + value.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-dob">Date of birth</FieldLabel>
                <Input
                  id="signup-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              {"phoneCountryCode" in identifier && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="signup-is-whatsapp"
                    checked={isWhatsApp}
                    onCheckedChange={(checked) => setIsWhatsApp(checked === true)}
                  />
                  <FieldLabel htmlFor="signup-is-whatsapp" className="font-normal">
                    This number is on WhatsApp
                  </FieldLabel>
                </div>
              )}
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
