import { clearEtagCache, readEtagCache, writeEtagCache } from "./etagCache"
import type * as z from "zod"
import { logger } from "@/lib/logger"

type FetchWithEtagOptions<T> = {
  onBackgroundUpdate?: (data: T) => void
  credentials?: RequestCredentials
  // Extra request headers, e.g. a bearer Authorization header for
  // admin-only-even-for-reads endpoints (see features/settings/api/appSettings.ts).
  headers?: HeadersInit
  // Called for a non-ok, non-304 response before the generic fallback error
  // is thrown — lets callers surface endpoint-specific errors (401/403/404).
  handleErrors?: (response: Response) => Promise<void>
  // On a 401, called once to mint a fresh access token and retry with it —
  // mirrors authorizedFetch's silent-refresh-and-retry for admin-only reads
  // that can't use authorizedFetch directly (this is a GET with its own
  // stale-while-revalidate caching, not a plain fetch).
  retryUnauthorized?: () => Promise<HeadersInit | null>
}

async function fetchOnce(
  url: string,
  etag: string | null,
  headers: HeadersInit | undefined,
  credentials?: RequestCredentials
): Promise<Response> {
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(etag ? { "If-None-Match": etag } : {}),
      ...headers,
    },
    ...(credentials ? { credentials } : {}),
  })
}

async function fetchAndCache<T>(
  url: string,
  cacheKey: string,
  schema: z.ZodType<T>,
  etag: string | null,
  options: Pick<FetchWithEtagOptions<T>, "credentials" | "headers" | "handleErrors" | "retryUnauthorized">
): Promise<T | null> {
  let response = await fetchOnce(url, etag, options.headers, options.credentials)

  if (response.status === 401 && options.retryUnauthorized) {
    const freshHeaders = await options.retryUnauthorized()
    if (freshHeaders) {
      response = await fetchOnce(url, etag, freshHeaders, options.credentials)
    }
  }

  if (response.status === 304) {
    return null
  }

  if (!response.ok) {
    logger.warn("http", `${response.status} ${response.statusText} — ${url}`)
    await options.handleErrors?.(response)
    throw new Error(`Failed to fetch ${url}`)
  }

  const json = await response.json()
  const data = await schema.parseAsync(json).catch((error: unknown) => {
    logger.error("http", `response failed schema validation — ${url}`, error)
    throw error
  })

  const newEtag = response.headers.get("etag")
  if (newEtag) {
    await writeEtagCache(cacheKey, newEtag, json)
  }

  return data
}

export async function fetchWithEtag<T>(
  url: string,
  cacheKey: string,
  schema: z.ZodType<T>,
  options: FetchWithEtagOptions<T> = {}
): Promise<T> {
  const cached = await readEtagCache(cacheKey)

  if (cached) {
    try {
      const cachedData = await schema.parseAsync(cached.data)

      // Stale-while-revalidate: hand back the cached value immediately — no
      // waiting on the network at all — and quietly refresh in the
      // background. A 304 means nothing changed; a 200 updates the cache and
      // notifies the caller so it can update its own state (e.g. push the
      // fresh data into a React Query cache).
      void fetchAndCache(url, cacheKey, schema, cached.etag, options)
        .then((data) => {
          if (data !== null) options.onBackgroundUpdate?.(data)
        })
        .catch((error: unknown) => {
          // Best-effort — a failed background revalidation just leaves the
          // cached value in place until the next natural refetch retries it.
          logger.debug("http", `background revalidation failed — ${url}`, error)
        })

      return cachedData
    } catch {
      // Cached payload no longer matches the schema — drop it and fall
      // through to a normal blocking fetch below.
      await clearEtagCache(cacheKey)
    }
  }

  const data = await fetchAndCache(url, cacheKey, schema, null, options)
  if (data === null) {
    // Unreachable in practice — a 304 only ever comes back when we sent an
    // ETag, which only happens in the cached branch above.
    throw new Error(`Unexpected 304 response with no cached data for ${url}`)
  }
  return data
}
