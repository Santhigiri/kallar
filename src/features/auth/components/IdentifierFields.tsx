import type { Identifier } from "@/features/auth/schemas/auth"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type IdentifierFieldsProps = {
  identifier: Identifier
  onChange: (identifier: Identifier) => void
  idPrefix: string
}

// TVM identifies a user by either email or phone — every auth-flow dialog
// (login, signup, forgot-password) needs the same email/phone picker.
export function IdentifierFields({ identifier, onChange, idPrefix }: IdentifierFieldsProps) {
  const method = "email" in identifier ? "email" : "phone"

  return (
    <Tabs
      value={method}
      onValueChange={(value) =>
        onChange(value === "email" ? { email: "" } : { phoneCountryCode: "+91", phoneNo: 0 })
      }
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="phone">Phone</TabsTrigger>
      </TabsList>
      <TabsContent value="email">
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-email`}>Email</FieldLabel>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            value={"email" in identifier ? identifier.email : ""}
            onChange={(e) => onChange({ email: e.target.value })}
            required
          />
        </Field>
      </TabsContent>
      <TabsContent value="phone">
        <div className="flex gap-2">
          <Field className="w-24">
            <FieldLabel htmlFor={`${idPrefix}-country-code`}>Code</FieldLabel>
            <Input
              id={`${idPrefix}-country-code`}
              value={"phoneCountryCode" in identifier ? identifier.phoneCountryCode : "+91"}
              onChange={(e) =>
                onChange({
                  phoneCountryCode: e.target.value,
                  phoneNo: "phoneNo" in identifier ? identifier.phoneNo : 0,
                })
              }
              required
            />
          </Field>
          <Field className="flex-1">
            <FieldLabel htmlFor={`${idPrefix}-phone`}>Phone number</FieldLabel>
            <Input
              id={`${idPrefix}-phone`}
              type="tel"
              autoComplete="tel-national"
              value={"phoneNo" in identifier && identifier.phoneNo ? String(identifier.phoneNo) : ""}
              onChange={(e) =>
                onChange({
                  phoneCountryCode: "phoneCountryCode" in identifier ? identifier.phoneCountryCode : "+91",
                  phoneNo: Number(e.target.value) || 0,
                })
              }
              required
            />
          </Field>
        </div>
      </TabsContent>
    </Tabs>
  )
}
