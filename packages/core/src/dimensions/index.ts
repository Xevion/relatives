import type { Dimension, Unit } from '@/types';
import { length } from './length';
import { mass } from './mass';
import { time } from './time';
import { volume } from './volume';
import { area } from './area';
import { velocity } from './velocity';

/**
 * All available dimensions
 */
export const dimensions: Record<string, Dimension> = {
  length,
  mass,
  time,
  volume,
  area,
  velocity,
};

/**
 * Get a dimension by ID
 */
export function getDimension(id: string): Dimension | undefined {
  return dimensions[id];
}

/**
 * Get a unit by ID, searching across all dimensions
 * Returns the unit and its parent dimension
 */
export function getUnit(unitId: string): { unit: Unit; dimension: Dimension } | undefined {
  for (const dimension of Object.values(dimensions)) {
    const unit = dimension.units.find((u) => u.id === unitId);
    if (unit) {
      return { unit, dimension };
    }
  }
  return undefined;
}

/**
 * Get a unit within a specific dimension
 */
export function getUnitInDimension(dimensionId: string, unitId: string): Unit | undefined {
  const dimension = dimensions[dimensionId];
  if (!dimension) return undefined;
  return dimension.units.find((u) => u.id === unitId);
}

/**
 * Convert a value from one unit to the base unit of its dimension
 */
export function toBaseUnit(value: number, unitId: string): number | undefined {
  const result = getUnit(unitId);
  if (!result) return undefined;
  return value * result.unit.toBase;
}

/**
 * Convert a value from the base unit to a target unit
 */
export function fromBaseUnit(value: number, unitId: string): number | undefined {
  const result = getUnit(unitId);
  if (!result) return undefined;
  return value / result.unit.toBase;
}

/**
 * Convert a value between two units in the same dimension
 */
export function convert(value: number, fromUnitId: string, toUnitId: string): number | undefined {
  const fromResult = getUnit(fromUnitId);
  const toResult = getUnit(toUnitId);

  if (!fromResult || !toResult) return undefined;
  if (fromResult.dimension.id !== toResult.dimension.id) return undefined;

  const baseValue = value * fromResult.unit.toBase;
  return baseValue / toResult.unit.toBase;
}

export { length, mass, time, volume, area, velocity };
