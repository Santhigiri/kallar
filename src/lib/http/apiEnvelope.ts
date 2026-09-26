import * as z from "zod"

// Every chandiroor /api/v2/* response body is wrapped as {success, message,
// data}. This validates the envelope and unwraps straight to `data` so
// callers can keep validating/typing the payload itself with their existing
// schema, unaware of the wrapper.
export function envelope<T>(schema: z.ZodType<T>): z.ZodType<T> {
  return z
    .object({
      success: z.boolean(),
      message: z.string(),
      data: schema,
    })
    .transform((body) => body.data)
}
