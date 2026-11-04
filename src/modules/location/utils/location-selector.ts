const CURRENT_CITY_CLASS_NAME =
  'bg-primary text-primary-foreground rounded-none px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase';

const SELECTABLE_CITY_CLASS_NAME =
  'text-muted hover:border-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background rounded-none border border-transparent px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none';

export function getCuratedCityButtonClassName(isCurrent: boolean): string {
  return isCurrent ? CURRENT_CITY_CLASS_NAME : SELECTABLE_CITY_CLASS_NAME;
}
