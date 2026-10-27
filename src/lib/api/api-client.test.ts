import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchOpenMeteo } from '@/lib/api/api-client';

const REQUEST_URL = 'https://example.test/forecast';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('fetchOpenMeteo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('server mode propagates the signal and does not set fetch cache options', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    const result = await fetchOpenMeteo<{ ok: boolean }>(REQUEST_URL, {
      cacheMode: 'server',
      signal: controller.signal,
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const init = fetchMock.mock.calls[0]?.[1];

    expect(init).toEqual({ signal: controller.signal });
    expect(init).not.toHaveProperty('next');
    expect(init).not.toHaveProperty('cache');
    expect(init).not.toHaveProperty('revalidate');
  });

  it('client mode uses no-store and never sets revalidate', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const controller = new AbortController();
    await fetchOpenMeteo(REQUEST_URL, { cacheMode: 'client', signal: controller.signal });

    const init = fetchMock.mock.calls[0]?.[1];

    expect(init).toEqual({ signal: controller.signal, cache: 'no-store' });
    expect(init).not.toHaveProperty('next');
    expect(init).not.toHaveProperty('revalidate');
  });

  it('throws ApiError with the status and the response body on a 400', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('Invalid hourly variable: no_existe', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await fetchOpenMeteo(REQUEST_URL, { cacheMode: 'client' }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw new Error('Expected an ApiError instance.');
    }

    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(400);
    expect(error.body).toBe('Invalid hourly variable: no_existe');
  });

  it('propagates network failures without wrapping them in ApiError', async () => {
    const networkError = new TypeError('Failed to fetch');
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(networkError);
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await fetchOpenMeteo(REQUEST_URL, { cacheMode: 'client' }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBe(networkError);
    expect(error).not.toBeInstanceOf(ApiError);
  });
});
