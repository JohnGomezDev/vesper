export class ApiError extends Error {
  readonly status: number | null;
  readonly body: string;

  constructor(message: string, status: number | null, body: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type TCacheMode = 'server' | 'client';

export interface IFetchOptions {
  cacheMode: TCacheMode;
  signal?: AbortSignal;
}

/**
 * Single entry point for Open-Meteo requests.
 *
 * The server relies on the `'use cache'` + `cacheLife` wrapper (SPEC §7.2),
 * so it does not set `next.revalidate` here. The browser never receives a
 * Next.js cache option and always uses `cache: 'no-store'`.
 */
export async function fetchOpenMeteo<T>(url: string, options: IFetchOptions): Promise<T> {
  const init: RequestInit =
    options.cacheMode === 'server'
      ? { signal: options.signal }
      : { signal: options.signal, cache: 'no-store' };

  const response = await fetch(url, init);

  if (!response.ok) {
    const body = await response.text();

    throw new ApiError(
      `Open-Meteo request failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  return (await response.json()) as T;
}
