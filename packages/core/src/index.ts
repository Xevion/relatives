// Types
export type {
  Unit,
  Dimension,
  Measurable,
  ComparisonFilters,
  ScoringWeights,
  ComparisonQuery,
  ComparisonResult,
  ComparisonResponse,
} from '@/types';

// Dimensions
export {
  dimensions,
  getDimension,
  getUnit,
  getUnitInDimension,
  toBaseUnit,
  fromBaseUnit,
  convert,
  length,
  mass,
  time,
  volume,
  area,
  velocity,
} from '@/dimensions';

// Measurables
export {
  measurablesByDimension,
  allMeasurables,
  getMeasurablesByDimension,
  getMeasurable,
  getAllTags,
} from '@/measurables';

// Scoring
export {
  DEFAULT_WEIGHTS,
  calculateClosenessScore,
  normalizeRelatability,
  normalizeAccuracy,
  normalizeWeights,
  calculateCompositeScore,
} from '@/scoring';

// Engine
export { ComparisonEngine, compare } from '@/engine';
