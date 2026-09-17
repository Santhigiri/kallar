// Env-aware logger. `debug`/`info`/`warn` are active in dev and staging and
// no-op in prod; `error` always logs (a prod user hitting a real error is
// exactly when you want it surfaced, e.g. to the browser console for a
// screenshot/report). Every call is tagged with a scope so log lines can be
// filtered (e.g. "[sw]", "[http]", "[auth]", "[query]").
const isProd = import.meta.env.MODE === "production" && !import.meta.env.DEV

export type LogScope = "app" | "sw" | "http" | "auth" | "query" | "vitals"

function format(scope: LogScope, message: string) {
  return `[${scope}] ${message}`
}

export const logger = {
  debug(scope: LogScope, message: string, ...args: Array<unknown>) {
    if (isProd) return
    console.debug(format(scope, message), ...args)
  },
  info(scope: LogScope, message: string, ...args: Array<unknown>) {
    if (isProd) return
    console.info(format(scope, message), ...args)
  },
  warn(scope: LogScope, message: string, ...args: Array<unknown>) {
    if (isProd) return
    console.warn(format(scope, message), ...args)
  },
  error(scope: LogScope, message: string, ...args: Array<unknown>) {
    console.error(format(scope, message), ...args)
  },
}
