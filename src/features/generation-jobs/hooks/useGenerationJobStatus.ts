import { useQuery } from "@tanstack/react-query"
import { getGenerationJob } from "../api/generationJobs"

// How often to poll a running generation job. This is the fallback path for
// progress — the live NDJSON stream (`startPanchangamGeneration`/
// `startSanthigiriEventOccurrences`) updates faster when it reaches the
// browser uninterrupted, but a reverse proxy or load balancer between the
// client and the API (nginx, a CDN, Cloud Run's front end) commonly buffers
// chunked responses, silently degrading the live push into "nothing, then
// the final result." Kept short enough that a quick generation run (a few
// seconds) still shows at least one intermediate progress update via polling
// alone, without the live stream.
export const GENERATION_JOB_POLL_INTERVAL_MS = 1500

export function useGenerationJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["generation-job", jobId],
    queryFn: () => getGenerationJob(jobId!),
    enabled: jobId !== null,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? GENERATION_JOB_POLL_INTERVAL_MS : false,
  })
}
