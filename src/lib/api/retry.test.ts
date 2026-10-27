import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/api-client';
import { shouldRetry } from '@/lib/api/retry';

function apiError(status: number | null): ApiError {
  return new ApiError(`Request failed with status ${String(status)}`, status, '');
}

describe('shouldRetry', () => {
  it('does not retry a 404', () => {
    expect(shouldRetry(0, apiError(404))).toBe(false);
  });

  it('does not retry a 400', () => {
    expect(shouldRetry(0, apiError(400))).toBe(false);
  });

  it('does not retry any other 4xx', () => {
    expect(shouldRetry(0, apiError(403))).toBe(false);
    expect(shouldRetry(1, apiError(422))).toBe(false);
  });

  it('retries a 429 until the retry cap is reached', () => {
    expect(shouldRetry(0, apiError(429))).toBe(true);
    expect(shouldRetry(2, apiError(429))).toBe(true);
    expect(shouldRetry(3, apiError(429))).toBe(false);
  });

  it('retries 5xx until the retry cap is reached', () => {
    expect(shouldRetry(0, apiError(500))).toBe(true);
    expect(shouldRetry(0, apiError(503))).toBe(true);
    expect(shouldRetry(3, apiError(503))).toBe(false);
  });

  it('retries network errors and ApiError instances without a status', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(0, apiError(null))).toBe(true);
    expect(shouldRetry(3, new TypeError('Failed to fetch'))).toBe(false);
  });
});

describe('retry timing', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries a 429 with the default exponential delay and stops after 3 retries', async () => {
    vi.useFakeTimers();

    const queryClient = new QueryClient();
    const queryFn = vi.fn<() => Promise<string>>().mockRejectedValue(apiError(429));
    const request = queryClient.query({
      queryKey: ['retry-429-test'],
      queryFn,
      retry: shouldRetry,
      networkMode: 'always',
    });
    const rejection = expect(request).rejects.toBeInstanceOf(ApiError);

    await vi.advanceTimersByTimeAsync(0);
    expect(queryFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(999);
    expect(queryFn).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(queryFn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(2_000);
    expect(queryFn).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(4_000);
    expect(queryFn).toHaveBeenCalledTimes(4);

    await rejection;
  });

  it('does not retry a 400', async () => {
    const queryClient = new QueryClient();
    const queryFn = vi.fn<() => Promise<string>>().mockRejectedValue(apiError(400));

    await expect(
      queryClient.query({
        queryKey: ['retry-400-test'],
        queryFn,
        retry: shouldRetry,
        networkMode: 'always',
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(queryFn).toHaveBeenCalledTimes(1);
  });
});
