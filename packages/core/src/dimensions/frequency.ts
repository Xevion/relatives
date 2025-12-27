import type { Dimension } from '@/types';

export const frequency: Dimension = {
  id: 'frequency',
  name: 'Frequency',
  baseUnit: 'hertz',
  units: [
    // SI units
    { id: 'hertz', symbol: 'Hz', toBase: 1 },
    { id: 'kilohertz', symbol: 'kHz', toBase: 1_000 },
    { id: 'megahertz', symbol: 'MHz', toBase: 1_000_000 },
    { id: 'gigahertz', symbol: 'GHz', toBase: 1_000_000_000 },
    { id: 'terahertz', symbol: 'THz', toBase: 1_000_000_000_000 },

    // Other
    { id: 'rpm', symbol: 'RPM', toBase: 1 / 60 },
    { id: 'bpm', symbol: 'BPM', toBase: 1 / 60 },
  ],
};
