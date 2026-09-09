import { useQuery } from "@tanstack/react-query"
import { getGenerationJob } from "../api/generationJobs"

// How often to poll a running generation job. Tweak this to change the cadence.
export const GENERATION_JOB_POLL_INTERVAL_MS = 4000

export function useGenerationJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["generation-job", jobId],
    queryFn: () => getGenerationJob(jobId!),
    enabled: jobId !== null,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? GENERATION_JOB_POLL_INTERVAL_MS : false,
  })
}
