// Mirrors the JOB_TYPE constants in the backend's generation routers
// (`features/panchangam/generation_router.py`, `features/santhigiri_events/router.py`).
const JOB_TYPE_LABELS: Record<string, string> = {
  panchangam_generate: "Panchangam data generation",
  event_occurrences: "Event occurrence generation",
  event_occurrences_all: "Event occurrence generation (all events)",
}

export function jobTypeLabel(jobType: string): string {
  return JOB_TYPE_LABELS[jobType] ?? jobType
}
