export type TCacheMode = 'server' | 'client';

export interface IFetchOptions {
  cacheMode: TCacheMode;
  signal?: AbortSignal;
}
