import type { Dimension } from '@/types';

export const energy: Dimension = {
  id: 'energy',
  name: 'Energy',
  baseUnit: 'joule',
  units: [
    // SI units
    { id: 'joule', symbol: 'J', toBase: 1 },
    { id: 'kilojoule', symbol: 'kJ', toBase: 1_000 },
    { id: 'megajoule', symbol: 'MJ', toBase: 1_000_000 },
    { id: 'gigajoule', symbol: 'GJ', toBase: 1_000_000_000 },

    // Calories
    { id: 'calorie', symbol: 'cal', toBase: 4.184 },
    { id: 'kilocalorie', symbol: 'kcal', toBase: 4_184 },

    // Electrical
    { id: 'watt-hour', symbol: 'Wh', toBase: 3_600 },
    { id: 'kilowatt-hour', symbol: 'kWh', toBase: 3_600_000 },

    // Particle physics
    { id: 'electronvolt', symbol: 'eV', toBase: 1.602_176_634e-19 },
    { id: 'kiloelectronvolt', symbol: 'keV', toBase: 1.602_176_634e-16 },

    // Imperial
    { id: 'british-thermal-unit', symbol: 'BTU', toBase: 1_055.06 },

    // TNT equivalent (explosives)
    { id: 'ton-tnt', symbol: 'ton TNT', toBase: 4.184e9 },
    { id: 'kiloton-tnt', symbol: 'kt TNT', toBase: 4.184e12 },
    { id: 'megaton-tnt', symbol: 'Mt TNT', toBase: 4.184e15 },
  ],
};
