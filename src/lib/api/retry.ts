import { ApiError } from '@/lib/api/api-client';

const MAX_RETRIES = 3;

/**
 * Retry policy from SPEC §7.3:
 * - 4xx (except 429): never retry.
 * - 429, 5xx and network failures: retry.
 *
 * The increasing wait is TanStack Query's default `retryDelay`, which is
 * `Math.min(1000 * 2 ** failureCount, 30000)` (verified in 5.104.5).
 * Because a retry function has no built-in cap, `MAX_RETRIES` stops the loop
 * so the UI can eventually show its error state.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) {
    return false;
  }

  if (!(error instanceof ApiError)) {
    return true;
  }

  if (error.status === null) {
    return true;
  }

  if (error.status === 429) {
    return true;
  }

  if (error.status >= 400 && error.status < 500) {
    return false;
  }

  return error.status >= 500;
}
