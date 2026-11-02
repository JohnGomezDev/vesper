const CURRENT_CITY_CLASS_NAME =
  'bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium';

const SELECTABLE_CITY_CLASS_NAME =
  'text-muted hover:bg-surface-muted hover:text-foreground focus-visible:ring-primary focus-visible:ring-offset-background rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

export function getCuratedCityButtonClassName(isCurrent: boolean): string {
  return isCurrent ? CURRENT_CITY_CLASS_NAME : SELECTABLE_CITY_CLASS_NAME;
}
