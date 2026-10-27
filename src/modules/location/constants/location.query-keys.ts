export const locationKeys = {
  all: (): readonly ['location'] => ['location'] as const,
  geocoding: (query: string): readonly ['geocoding', string] => ['geocoding', query] as const,
} as const;
