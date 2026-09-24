import { useTranslation } from "react-i18next"
import type { KollavarshamDate } from "@/features/panchangam/schemas/panchangamData"

type DateHeaderProps = {
  date: Date,
  kv_date: KollavarshamDate
}

export default function DateHeader({ date, kv_date }: DateHeaderProps) {
  const { i18n } = useTranslation()
  const kv_month_name = i18n.language === "ml" ? kv_date.kv_month_name_ml : kv_date.kv_month_name_en
  return (
    <div className="flex flex-col">
      <p className="font-playfair-display font-semibold text-2xl text-center col-span-2">{date.toLocaleDateString(i18n.language, { 'weekday': 'long' })}</p>
      <p className="text-md font-inter font-medium text-secondary text-center"> {date.toLocaleDateString(i18n.language, { 'month': 'long' })} {date.getDate()}, {date.getFullYear()}</p>
      <p className="text-md font-inter font-medium text-secondary text-center"> {kv_month_name} {kv_date.kv_day}, {kv_date.kv_year}</p>
    </div>
  )
}
