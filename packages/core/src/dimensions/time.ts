import type { Dimension } from '@/types';

export const time: Dimension = {
  id: 'time',
  name: 'Time / Duration',
  baseUnit: 'second',
  units: [
    // SI
    { id: 'second', symbol: 's', toBase: 1 },
    { id: 'millisecond', symbol: 'ms', toBase: 0.001 },
    { id: 'microsecond', symbol: 'µs', toBase: 1e-6 },
    { id: 'nanosecond', symbol: 'ns', toBase: 1e-9 },
    { id: 'picosecond', symbol: 'ps', toBase: 1e-12 },

    // Common
    { id: 'minute', symbol: 'min', toBase: 60 },
    { id: 'hour', symbol: 'hr', toBase: 3_600 },
    { id: 'day', symbol: 'd', toBase: 86_400 },
    { id: 'week', symbol: 'wk', toBase: 604_800 },
    { id: 'month', symbol: 'mo', toBase: 2_629_746 }, // average month (365.25/12 days)
    { id: 'year', symbol: 'yr', toBase: 31_556_952 }, // average year (365.25 days)

    // Large scales
    { id: 'decade', symbol: 'dec', toBase: 315_569_520 },
    { id: 'century', symbol: 'cent', toBase: 3_155_695_200 },
    { id: 'millennium', symbol: 'kyr', toBase: 31_556_952_000 },
    { id: 'million-years', symbol: 'Myr', toBase: 31_556_952_000_000 },
    { id: 'billion-years', symbol: 'Gyr', toBase: 31_556_952_000_000_000 },
  ],
};
