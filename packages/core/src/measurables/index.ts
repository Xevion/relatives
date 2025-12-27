import type { Measurable } from '@/types';
import { lengthMeasurables } from './length';
import { massMeasurables } from './mass';
import { timeMeasurables } from './time';
import { volumeMeasurables } from './volume';
import { areaMeasurables } from './area';
import { velocityMeasurables } from './velocity';
import { temperatureMeasurables } from './temperature';
import { energyMeasurables } from './energy';
import { powerMeasurables } from './power';
import { dataMeasurables } from './data';
import { pressureMeasurables } from './pressure';
import { forceMeasurables } from './force';
import { frequencyMeasurables } from './frequency';

/**
 * All measurables organized by dimension
 */
export const measurablesByDimension: Record<string, Measurable[]> = {
  length: lengthMeasurables,
  mass: massMeasurables,
  time: timeMeasurables,
  volume: volumeMeasurables,
  area: areaMeasurables,
  velocity: velocityMeasurables,
  temperature: temperatureMeasurables,
  energy: energyMeasurables,
  power: powerMeasurables,
  data: dataMeasurables,
  pressure: pressureMeasurables,
  force: forceMeasurables,
  frequency: frequencyMeasurables,
};

/**
 * All measurables as a flat array
 */
export const allMeasurables: Measurable[] = Object.values(measurablesByDimension).flat();

/**
 * Get all measurables for a dimension
 */
export function getMeasurablesByDimension(dimensionId: string): Measurable[] {
  return measurablesByDimension[dimensionId] ?? [];
}

/**
 * Get a measurable by ID
 */
export function getMeasurable(id: string): Measurable | undefined {
  return allMeasurables.find((m) => m.id === id);
}

/**
 * Get all unique tags across all measurables
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const measurable of allMeasurables) {
    for (const tag of measurable.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export {
  lengthMeasurables,
  massMeasurables,
  timeMeasurables,
  volumeMeasurables,
  areaMeasurables,
  velocityMeasurables,
  temperatureMeasurables,
  energyMeasurables,
  powerMeasurables,
  dataMeasurables,
  pressureMeasurables,
  forceMeasurables,
  frequencyMeasurables,
};
