import type { Dimension } from '@/types';

export const pressure: Dimension = {
  id: 'pressure',
  name: 'Pressure',
  baseUnit: 'pascal',
  units: [
    // SI units
    { id: 'pascal', symbol: 'Pa', toBase: 1 },
    { id: 'kilopascal', symbol: 'kPa', toBase: 1_000 },
    { id: 'megapascal', symbol: 'MPa', toBase: 1_000_000 },
    { id: 'gigapascal', symbol: 'GPa', toBase: 1_000_000_000 },

    // Atmospheric
    { id: 'atmosphere', symbol: 'atm', toBase: 101_325 },
    { id: 'bar', symbol: 'bar', toBase: 100_000 },
    { id: 'millibar', symbol: 'mbar', toBase: 100 },

    // Imperial
    { id: 'psi', symbol: 'psi', toBase: 6_894.76 },

    // Other
    { id: 'torr', symbol: 'Torr', toBase: 133.322 },
    { id: 'mmHg', symbol: 'mmHg', toBase: 133.322 },
  ],
};
