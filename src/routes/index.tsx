import { createFileRoute } from "@tanstack/react-router";
import RouteErrorFallback from "@/components/shared/RouteErrorFallback";
import DayDetailsPage from "@/features/day-details/components/DayDetailsPage";

export const Route = createFileRoute("/")({ component: App, errorComponent: RouteErrorFallback });

function App() {

  return (
    <div className="flex bg-card">
      <div className="w-full">
        <DayDetailsPage />
      </div>
    </div>
  );
}
