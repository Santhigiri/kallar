import { useQuery } from "@tanstack/react-query"
import { getActiveGenerationJob } from "../api/generationJobs"
import { GENERATION_JOB_POLL_INTERVAL_MS } from "./useGenerationJobStatus"

// Looks for a job already running (started from this tab, another tab, or
// another admin) so callers can show its live progress instead of a static
// "a job is already running" note. Keeps polling only while a job is found
// running, so it goes quiet again once nothing is active.
export function useActiveGenerationJob(enabled: boolean) {
  return useQuery({
    queryKey: ["generation-job-active"],
    queryFn: getActiveGenerationJob,
    enabled,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? GENERATION_JOB_POLL_INTERVAL_MS : false,
  })
}
