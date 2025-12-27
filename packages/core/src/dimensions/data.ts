import type { Dimension } from '@/types';

export const data: Dimension = {
  id: 'data',
  name: 'Data / Information',
  baseUnit: 'byte',
  units: [
    // Bits
    { id: 'bit', symbol: 'bit', toBase: 0.125 },
    { id: 'kilobit', symbol: 'Kb', toBase: 125 },
    { id: 'megabit', symbol: 'Mb', toBase: 125_000 },
    { id: 'gigabit', symbol: 'Gb', toBase: 125_000_000 },

    // Bytes
    { id: 'byte', symbol: 'B', toBase: 1 },
    { id: 'kilobyte', symbol: 'KB', toBase: 1_000 },
    { id: 'megabyte', symbol: 'MB', toBase: 1_000_000 },
    { id: 'gigabyte', symbol: 'GB', toBase: 1_000_000_000 },
    { id: 'terabyte', symbol: 'TB', toBase: 1_000_000_000_000 },
    { id: 'petabyte', symbol: 'PB', toBase: 1_000_000_000_000_000 },
    { id: 'exabyte', symbol: 'EB', toBase: 1e18 },
    { id: 'zettabyte', symbol: 'ZB', toBase: 1e21 },

    // Binary (IEC standard)
    { id: 'kibibyte', symbol: 'KiB', toBase: 1_024 },
    { id: 'mebibyte', symbol: 'MiB', toBase: 1_048_576 },
    { id: 'gibibyte', symbol: 'GiB', toBase: 1_073_741_824 },
    { id: 'tebibyte', symbol: 'TiB', toBase: 1_099_511_627_776 },
  ],
};
