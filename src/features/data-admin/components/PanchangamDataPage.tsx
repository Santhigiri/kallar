import { useTranslation } from "react-i18next"
import GuruvaniTab from "./tabs/GuruvaniTab"
import NakshatraTab from "./tabs/NakshatraTab"
import PanchangamTab from "./tabs/PanchangamTab"
import SanthigiriEventsTab from "./tabs/SanthigiriEventsTab"
import ThithiTab from "./tabs/ThithiTab"
import TopAppBar from "@/components/shared/TopAppBar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "panchangam", labelKey: "dataAdmin.tabs.panchangam" },
  { value: "nakshatra", labelKey: "dataAdmin.tabs.nakshatra" },
  { value: "thithi", labelKey: "dataAdmin.tabs.thithi" },
  { value: "santhigiri-events", labelKey: "dataAdmin.tabs.santhigiriEvents" },
  { value: "guruvanis", labelKey: "dataAdmin.tabs.guruvanis" },
]

export default function PanchangamDataPage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title={t("dataAdmin.title")} />

      <Tabs defaultValue="panchangam" className="p-2">
        <TabsList>
          {TABS.map(({ value, labelKey }) => (
            <TabsTrigger key={value} value={value}>
              {t(labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="panchangam">
          <PanchangamTab />
        </TabsContent>
        <TabsContent value="nakshatra">
          <NakshatraTab />
        </TabsContent>
        <TabsContent value="thithi">
          <ThithiTab />
        </TabsContent>
        <TabsContent value="santhigiri-events">
          <SanthigiriEventsTab />
        </TabsContent>
        <TabsContent value="guruvanis">
          <GuruvaniTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
