import type { Dimension } from '@/types';

export const velocity: Dimension = {
  id: 'velocity',
  name: 'Speed / Velocity',
  baseUnit: 'meter-per-second',
  units: [
    // Metric
    { id: 'meter-per-second', symbol: 'm/s', toBase: 1 },
    { id: 'kilometer-per-hour', symbol: 'km/h', toBase: 0.277_777_778 },
    { id: 'kilometer-per-second', symbol: 'km/s', toBase: 1_000 },

    // Imperial
    { id: 'mile-per-hour', symbol: 'mph', toBase: 0.447_04 },
    { id: 'foot-per-second', symbol: 'ft/s', toBase: 0.3048 },

    // Special
    { id: 'knot', symbol: 'kn', toBase: 0.514_444_444 },
    { id: 'mach', symbol: 'Ma', toBase: 343 }, // at sea level, 20°C
    { id: 'speed-of-light', symbol: 'c', toBase: 299_792_458 },
  ],
};
