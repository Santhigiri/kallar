import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { logger } from "@/lib/logger"

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      logger.error("query", `query failed — ${JSON.stringify(query.queryKey)}`, error)
    },
  }),
  mutationCache: new MutationCache({
    onError(error, _variables, _context, mutation) {
      logger.error("query", `mutation failed — ${mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : "unlabeled"}`, error)
    },
  }),
})
