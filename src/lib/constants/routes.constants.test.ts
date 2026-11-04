import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/lib/constants/routes.constants';

describe('ROUTES', () => {
  it('construye la ruta de detalle de clima', () => {
    expect(ROUTES.clima.detail('bogota')).toBe('/clima/bogota');
  });
});
