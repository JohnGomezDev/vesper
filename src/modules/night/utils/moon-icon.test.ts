import { describe, expect, it } from 'vitest';
import { getMoonIconPath } from '@/modules/night/utils/moon-icon';

describe('getMoonIconPath', () => {
  it('renders no illuminated area for the new moon and a closed circle for the full moon', () => {
    expect(getMoonIconPath('new-moon', 0)).toBe('');
    expect(getMoonIconPath('full-moon', 100)).toContain('A28 28');
  });

  it('renders the waxing and waning sides with opposite sweep flags', () => {
    const waxing = getMoonIconPath('waxing-crescent', 25);
    const waning = getMoonIconPath('waning-crescent', 25);

    expect(waxing).toContain('A28 28 0 0 1');
    expect(waning).toContain('A28 28 0 0 0');
    expect(waxing).not.toBe(waning);
  });

  it('keeps the quarter phase as a half circle', () => {
    expect(getMoonIconPath('first-quarter', 50)).toContain('A0.5 28');
    expect(getMoonIconPath('last-quarter', 50)).toContain('A0.5 28');
  });
});
