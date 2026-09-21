import { AlertTriangle } from "lucide-react";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered in place of children once an error is caught. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Label shown in the default fallback, e.g. "sunrise/sunset". */
  label?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Error boundaries must be class components — React has no hook equivalent
// of getDerivedStateFromError/componentDidCatch.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          <span className="font-medium">
            {this.props.label ? `Couldn't load ${this.props.label}` : "Something went wrong"}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={this.reset}>
          Try again
        </Button>
      </div>
    );
  }
}
