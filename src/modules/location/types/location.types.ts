export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface ILocation {
  slug: string;
  name: string;
  coordinates: ICoordinates;
  elevationM: number | null;
  timeZone: string;
  isCurated: boolean;
}

export type TSlugParseResult =
  | { kind: 'curated'; slug: string }
  | { kind: 'coordinates'; label: string | null; coordinates: ICoordinates }
  | { kind: 'invalid' };

export type TDateParamResult =
  | { kind: 'valid'; date: string }
  | { kind: 'missing' }
  | { kind: 'invalid' }
  | { kind: 'out-of-range' };
