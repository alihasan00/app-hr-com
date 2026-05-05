import { QueryClient } from "@tanstack/react-query";

/**
 * Module singleton so non-React code (e.g. axios interceptors, auth store) can
 * clear cached queries on logout — same idea as RegulateIQ `lib/query-client.ts`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 min of freshness covers typical dashboard navigation without
      // flicker; per-query `staleTime` can still shrink this for polling.
      staleTime: 5 * 60_000,
      // Keep data in cache ~10 min after unmount so back-nav hits cache.
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
    },
    mutations: {
      retry: 0,
    },
  },
});
