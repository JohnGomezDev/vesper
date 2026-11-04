import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { ApiError } from '@/lib/api/api-client';
import { searchLocations } from '@/modules/location/services/geocoding.service';
import type { IGeocodingResponse } from '@/modules/location/types/location.types';

const BOGOTA_RESULT = {
  id: 3688689,
  name: 'Bogotá',
  latitude: 4.60971,
  longitude: -74.08175,
  elevation: 2582,
  timezone: 'America/Bogota',
  country: 'Colombia',
  admin1: 'Bogotá D.C.',
  admin2: 'Bogotá, D.C.',
};

const GEOCODING_RESPONSE: IGeocodingResponse = { results: [BOGOTA_RESULT] };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function firstRequestUrl(fetchMock: Mock<typeof fetch>): URL {
  const input = fetchMock.mock.calls[0]?.[0];

  if (input === undefined) {
    throw new Error('fetch was not called.');
  }

  return new URL(String(input));
}

describe('searchLocations', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects a trimmed query shorter than 3 characters before calling fetch', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchLocations('  Bo  ', { cacheMode: 'client' })).rejects.toThrow(
      'Geocoding queries must contain at least 3 characters.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests name, count and language and returns the results', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(GEOCODING_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchLocations('  Bogotá  ', { cacheMode: 'client' });

    expect(result).toEqual([BOGOTA_RESULT]);

    const url = firstRequestUrl(fetchMock);

    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(url.searchParams.get('name')).toBe('Bogotá');
    expect(url.searchParams.get('count')).toBe('7');
    expect(url.searchParams.get('language')).toBe('es');
    expect(url.searchParams.has('elevation')).toBe(false);
  });

  it('returns an empty array when Open-Meteo omits results', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ generationtime_ms: 0 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchLocations('Bog', { cacheMode: 'client' })).resolves.toEqual([]);
  });

  it('throws ApiError on a 400', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('Invalid name parameter', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await searchLocations('Bog', { cacheMode: 'client' }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw new Error('Expected an ApiError instance.');
    }

    expect(error.status).toBe(400);
    expect(error.body).toBe('Invalid name parameter');
  });

  it('rejects a malformed successful response', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ results: [{}] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchLocations('Bog', { cacheMode: 'client' })).rejects.toThrow(
      'Invalid geocoding response from Open-Meteo.',
    );
  });
});
