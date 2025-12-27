import type { Dimension } from '@/types';

export const power: Dimension = {
  id: 'power',
  name: 'Power',
  baseUnit: 'watt',
  units: [
    // SI units
    { id: 'watt', symbol: 'W', toBase: 1 },
    { id: 'kilowatt', symbol: 'kW', toBase: 1_000 },
    { id: 'megawatt', symbol: 'MW', toBase: 1_000_000 },
    { id: 'gigawatt', symbol: 'GW', toBase: 1_000_000_000 },
    { id: 'milliwatt', symbol: 'mW', toBase: 0.001 },

    // Imperial
    { id: 'horsepower', symbol: 'hp', toBase: 745.7 },

    // Other
    { id: 'btu-per-hour', symbol: 'BTU/h', toBase: 0.293071 },
  ],
};
