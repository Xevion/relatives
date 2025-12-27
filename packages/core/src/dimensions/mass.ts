import type { Dimension } from '@/types';

export const mass: Dimension = {
  id: 'mass',
  name: 'Mass / Weight',
  baseUnit: 'kilogram',
  units: [
    // Metric
    { id: 'kilogram', symbol: 'kg', toBase: 1 },
    { id: 'gram', symbol: 'g', toBase: 0.001 },
    { id: 'milligram', symbol: 'mg', toBase: 1e-6 },
    { id: 'microgram', symbol: 'µg', toBase: 1e-9 },
    { id: 'metric-ton', symbol: 't', toBase: 1_000 },

    // Imperial
    { id: 'pound', symbol: 'lb', toBase: 0.453_592_37 },
    { id: 'ounce', symbol: 'oz', toBase: 0.028_349_523_125 },
    { id: 'ton', symbol: 'ton', toBase: 907.184_74 }, // US short ton
    { id: 'stone', symbol: 'st', toBase: 6.350_293_18 },

    // Astronomical
    { id: 'solar-mass', symbol: 'M☉', toBase: 1.989e30 },
    { id: 'earth-mass', symbol: 'M⊕', toBase: 5.972e24 },
  ],
};
