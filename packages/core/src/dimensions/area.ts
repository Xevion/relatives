import type { Dimension } from '@/types';

export const area: Dimension = {
  id: 'area',
  name: 'Area',
  baseUnit: 'square-meter',
  units: [
    // Metric
    { id: 'square-meter', symbol: 'm²', toBase: 1 },
    { id: 'square-kilometer', symbol: 'km²', toBase: 1_000_000 },
    { id: 'square-centimeter', symbol: 'cm²', toBase: 0.0001 },
    { id: 'square-millimeter', symbol: 'mm²', toBase: 0.000_001 },
    { id: 'square-micrometer', symbol: 'µm²', toBase: 1e-12 },
    { id: 'hectare', symbol: 'ha', toBase: 10_000 },

    // Imperial
    { id: 'square-foot', symbol: 'ft²', toBase: 0.092_903_04 },
    { id: 'square-inch', symbol: 'in²', toBase: 0.000_645_16 },
    { id: 'square-yard', symbol: 'yd²', toBase: 0.836_127_36 },
    { id: 'square-mile', symbol: 'mi²', toBase: 2_589_988.110_336 },
    { id: 'acre', symbol: 'ac', toBase: 4_046.856_422_4 },
  ],
};
