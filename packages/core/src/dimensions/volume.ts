import type { Dimension } from '@/types';

export const volume: Dimension = {
  id: 'volume',
  name: 'Volume / Capacity',
  baseUnit: 'liter',
  units: [
    // Metric
    { id: 'liter', symbol: 'L', toBase: 1 },
    { id: 'milliliter', symbol: 'mL', toBase: 0.001 },
    { id: 'cubic-meter', symbol: 'm³', toBase: 1_000 },
    { id: 'cubic-centimeter', symbol: 'cm³', toBase: 0.001 },

    // Imperial
    { id: 'gallon', symbol: 'gal', toBase: 3.785_411_784 }, // US gallon
    { id: 'quart', symbol: 'qt', toBase: 0.946_352_946 }, // US quart
    { id: 'pint', symbol: 'pt', toBase: 0.473_176_473 }, // US pint
    { id: 'cup', symbol: 'cup', toBase: 0.236_588_236_5 }, // US cup
    { id: 'fluid-ounce', symbol: 'fl oz', toBase: 0.029_573_529_5625 }, // US fl oz
    { id: 'tablespoon', symbol: 'tbsp', toBase: 0.014_786_764_78 },
    { id: 'teaspoon', symbol: 'tsp', toBase: 0.004_928_921_59 },

    // Imperial UK
    { id: 'imperial-gallon', symbol: 'imp gal', toBase: 4.546_09 },

    // Cubic
    { id: 'cubic-foot', symbol: 'ft³', toBase: 28.316_846_592 },
    { id: 'cubic-inch', symbol: 'in³', toBase: 0.016_387_064 },
    { id: 'cubic-kilometer', symbol: 'km³', toBase: 1e12 },
  ],
};
