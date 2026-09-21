import GuruvaniTab from "./tabs/GuruvaniTab"
import NakshatraTab from "./tabs/NakshatraTab"
import PanchangamTab from "./tabs/PanchangamTab"
import SanthigiriEventsTab from "./tabs/SanthigiriEventsTab"
import ThithiTab from "./tabs/ThithiTab"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import TopAppBar from "@/components/shared/TopAppBar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  { value: "panchangam", label: "Panchangam" },
  { value: "nakshatra", label: "Nakshatra" },
  { value: "thithi", label: "Thithi" },
  { value: "santhigiri-events", label: "Santhigiri Events" },
  { value: "guruvanis", label: "Guruvanis" },
]

export default function PanchangamDataPage() {
  return (
    <div className="flex flex-col items-stretch">
      <TopAppBar title="Panchangam Data" />

      <Tabs defaultValue="panchangam" className="p-2">
        <TabsList>
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="panchangam">
          <ErrorBoundary label="the panchangam table">
            <PanchangamTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="nakshatra">
          <ErrorBoundary label="the nakshatra table">
            <NakshatraTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="thithi">
          <ErrorBoundary label="the thithi table">
            <ThithiTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="santhigiri-events">
          <ErrorBoundary label="Santhigiri events">
            <SanthigiriEventsTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="guruvanis">
          <ErrorBoundary label="Guruvanis">
            <GuruvaniTab />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
