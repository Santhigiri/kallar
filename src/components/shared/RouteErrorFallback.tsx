import { AlertTriangle } from "lucide-react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

// Default errorComponent for route-level error boundaries (see __root.tsx
// and the individual route files) — TanStack Router calls this in place of
// a route's component when it or its loader throws.
export default function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <main className="container mx-auto flex flex-col items-start gap-3 p-4 pt-16">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="size-5" />
        <h1 className="text-lg font-semibold">Something went wrong</h1>
      </div>
      <p className="text-sm text-muted-foreground">{error.message || "This page failed to load."}</p>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
