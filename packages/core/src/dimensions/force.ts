import type { Dimension } from '@/types';

export const force: Dimension = {
  id: 'force',
  name: 'Force',
  baseUnit: 'newton',
  units: [
    // SI units
    { id: 'newton', symbol: 'N', toBase: 1 },
    { id: 'kilonewton', symbol: 'kN', toBase: 1_000 },
    { id: 'meganewton', symbol: 'MN', toBase: 1_000_000 },

    // Weight-force
    { id: 'kilogram-force', symbol: 'kgf', toBase: 9.80665 },
    { id: 'gram-force', symbol: 'gf', toBase: 0.00980665 },

    // Imperial
    { id: 'pound-force', symbol: 'lbf', toBase: 4.44822 },
    { id: 'ounce-force', symbol: 'ozf', toBase: 0.278014 },

    // Other
    { id: 'dyne', symbol: 'dyn', toBase: 1e-5 },
  ],
};
