import {
  CLOUD_CLASS_BACKGROUND_CLASSES,
  CLOUD_CLASS_LABELS_ES,
  CLOUD_CLASS_ORDER,
} from '@/modules/night/constants/cloud.constants';

/** Legend of the cloud classes; the text label is part of each entry, not only the colour. */
export function CloudLegend(): React.JSX.Element {
  return (
    <div aria-label="Leyenda de clases de nubosidad" className="flex flex-wrap items-center gap-3">
      {CLOUD_CLASS_ORDER.map((cloudClass) => (
        <span key={cloudClass} className="text-muted flex items-center gap-1.5 text-[11px]">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${CLOUD_CLASS_BACKGROUND_CLASSES[cloudClass]}`}
          />
          {CLOUD_CLASS_LABELS_ES[cloudClass]}
        </span>
      ))}
    </div>
  );
}
