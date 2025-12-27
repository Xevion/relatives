import type { Dimension } from '@/types';

export const length: Dimension = {
  id: 'length',
  name: 'Length / Distance',
  baseUnit: 'meter',
  units: [
    // Metric
    { id: 'meter', symbol: 'm', toBase: 1 },
    { id: 'kilometer', symbol: 'km', toBase: 1_000 },
    { id: 'centimeter', symbol: 'cm', toBase: 0.01 },
    { id: 'millimeter', symbol: 'mm', toBase: 0.001 },
    { id: 'micrometer', symbol: 'µm', toBase: 1e-6 },
    { id: 'nanometer', symbol: 'nm', toBase: 1e-9 },
    { id: 'picometer', symbol: 'pm', toBase: 1e-12 },

    // Imperial
    { id: 'inch', symbol: 'in', toBase: 0.0254 },
    { id: 'foot', symbol: 'ft', toBase: 0.3048 },
    { id: 'yard', symbol: 'yd', toBase: 0.9144 },
    { id: 'mile', symbol: 'mi', toBase: 1_609.344 },

    // Astronomical
    { id: 'astronomical-unit', symbol: 'AU', toBase: 1.495_978_707e11 },
    { id: 'light-year', symbol: 'ly', toBase: 9.460_730_472_580_8e15 },
    { id: 'parsec', symbol: 'pc', toBase: 3.085_677_581e16 },

    // Other
    { id: 'angstrom', symbol: 'Å', toBase: 1e-10 },
  ],
};
