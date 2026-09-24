import * as z from "zod"

export const guruvaniTranslation = z.object({
  language_code: z.string(),
  text: z.string(),
})

export const guruvani = z.object({
  id: z.number().int(),
  sort_order: z.number().int(),
  translations: z.array(guruvaniTranslation),
})

export type GuruvaniTranslation = z.infer<typeof guruvaniTranslation>
export type Guruvani = z.infer<typeof guruvani>

export type GuruvaniFormValues = {
  text_en: string
  text_ml: string
  sort_order: number | null
}

export function getGuruvaniText(entry: Guruvani, languageCode: string): string | undefined {
  return entry.translations.find((t) => t.language_code === languageCode)?.text
}
