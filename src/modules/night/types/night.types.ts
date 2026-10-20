export type TNightWindow =
  { kind: 'available'; startMs: number; endMs: number } | { kind: 'no-astronomical-night' };

export type TDailySun = {
  date: string;
  sunrise: string | null;
  sunset: string | null;
};
