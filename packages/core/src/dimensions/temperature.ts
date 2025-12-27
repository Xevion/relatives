import type { Dimension } from '@/types';

export const temperature: Dimension = {
  id: 'temperature',
  name: 'Temperature',
  baseUnit: 'kelvin',
  units: [
    { id: 'kelvin', symbol: 'K', toBase: 1 },
    { id: 'celsius', symbol: '°C', toBase: 1 },
    { id: 'fahrenheit', symbol: '°F', toBase: 5 / 9 },
  ],
};
