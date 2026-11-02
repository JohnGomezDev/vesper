import { describe, expect, it } from 'vitest';
import {
  formatDataTime,
  formatDewPointSpread,
  formatHumidity,
  formatPercent,
  formatPrecipitation,
  formatTemperature,
  formatVisibility,
  formatWindSpeed,
} from '@/modules/weather/utils/format';

describe('weather format helpers', () => {
  it('renders missing measurements as an em dash, never as zero', () => {
    expect(formatTemperature(null)).toBe('—');
    expect(formatHumidity(null)).toBe('—');
    expect(formatPercent(null)).toBe('—');
    expect(formatVisibility(null)).toBe('—');
    expect(formatWindSpeed(null)).toBe('—');
    expect(formatPrecipitation(null)).toBe('—');
    expect(formatDewPointSpread(null, 10)).toBe('—');
    expect(formatDewPointSpread(10, null)).toBe('—');
  });

  it('formats temperatures and percentages with Spanish decimals', () => {
    expect(formatTemperature(6.2)).toBe('6,2 °C');
    expect(formatPercent(0)).toBe('0 %');
    expect(formatPercent(12.5)).toBe('13 %');
    expect(formatPercent(12.5, 1)).toBe('12,5 %');
  });

  it('formats visibility in metres or kilometres', () => {
    expect(formatVisibility(500)).toBe('500 m');
    expect(formatVisibility(18_400)).toBe('18,4 km');
  });

  it('formats wind, rain and the dew-point spread', () => {
    expect(formatWindSpeed(14)).toBe('14 km/h');
    expect(formatPrecipitation(0.4)).toBe('0,4 mm');
    expect(formatDewPointSpread(10, 4)).toBe('6 °C');
  });

  it('shows the Open-Meteo local data time', () => {
    expect(formatDataTime('2026-10-19T18:00')).toBe('18:00');
    expect(formatDataTime('2026-10-19T18:30')).toBe('18:30');
  });
});
