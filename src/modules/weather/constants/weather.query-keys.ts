export const weatherKeys = {
  all: (): readonly ['weather'] => ['weather'] as const,
  forecast: (latitude: number, longitude: number): readonly ['forecast', number, number] =>
    ['forecast', latitude, longitude] as const,
  current: (latitude: number, longitude: number): readonly ['current', number, number] =>
    ['current', latitude, longitude] as const,
} as const;
