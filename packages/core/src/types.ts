/**
 * A unit of measurement within a dimension
 */
export interface Unit {
  /** Unique identifier (e.g., "meter", "kilometer") */
  id: string;
  /** Display symbol (e.g., "m", "km") */
  symbol: string;
  /** Multiplier to convert to base unit */
  toBase: number;
}

/**
 * A dimension of measurement (length, mass, time, etc.)
 */
export interface Dimension {
  /** Unique identifier (e.g., "length", "mass") */
  id: string;
  /** Human-readable name */
  name: string;
  /** The base unit id for this dimension */
  baseUnit: string;
  /** All units in this dimension */
  units: Unit[];
}

/**
 * A known fact/measurement that can be used for comparisons
 */
export interface Measurable {
  /** Unique identifier (e.g., "human-hair-thickness") */
  id: string;
  /** Human-readable name */
  name: string;
  /** Optional description providing context */
  description?: string;

  /** The dimension this measurable belongs to */
  dimension: string;
  /** The value in the specified unit */
  value: number;
  /** The unit of the value */
  unit: string;

  /** Optional minimum value for ranges */
  valueMin?: number;
  /** Optional maximum value for ranges */
  valueMax?: number;

  /** Tags for filtering (e.g., ["biology", "human-body", "universal"]) */
  tags: string[];
  /** How universally understood this is (1-10) */
  relatability: number;
  /** How precise/consistent this value is (1-10) */
  accuracy: number;

  /** Optional source citations */
  sources?: string[];
}

/**
 * Filters to apply when searching for comparisons
 */
export interface ComparisonFilters {
  /** Only include measurables with ALL of these tags */
  includeTags?: string[];
  /** Exclude measurables with ANY of these tags */
  excludeTags?: string[];
}

/**
 * Weights for scoring comparisons (should sum to 1, but will be normalized)
 */
export interface ScoringWeights {
  /** Weight for how "nice" the ratio is (default: 0.33) */
  closeness?: number;
  /** Weight for how well-known the measurable is (default: 0.33) */
  relatability?: number;
  /** Weight for how accurate the measurable's value is (default: 0.33) */
  accuracy?: number;
}

/**
 * Configuration for intelligent result cutoff
 */
export interface ResultCutoff {
  /** Minimum absolute score to include (0-1). Default: 0.15 */
  minScore?: number;
  /** Minimum score relative to top result (0-1). Default: 0.2 */
  minRelativeScore?: number;
  /** Always show at least this many results. Default: 5 */
  minResults?: number;
  /** Never show more than this many results (safety). Default: 50 */
  maxResults?: number;
}

/**
 * A query to find comparisons for a given quantity
 */
export interface ComparisonQuery {
  /** The value to compare */
  value: number;
  /** The unit of the value */
  unit: string;
  /** The dimension (can be inferred from unit if unambiguous) */
  dimension: string;

  /** Optional filters */
  filters?: ComparisonFilters;
  /** Optional scoring weights */
  weights?: ScoringWeights;
  /** Intelligent cutoff configuration (optional) */
  cutoff?: ResultCutoff;
}

/**
 * A single comparison result
 */
export interface ComparisonResult {
  /** The matched measurable */
  measurable: Measurable;
  /**
   * The ratio of query value to measurable value
   * - ratio > 1: query is larger ("2x bigger than X")
   * - ratio < 1: query is smaller ("half the size of X")
   * - ratio = 1: equal
   */
  ratio: number;
  /** Score for how "nice" the ratio is (0-1) */
  closenessScore: number;
  /** Final weighted composite score (0-1) */
  compositeScore: number;
}

/**
 * The full response from a comparison query
 */
export interface ComparisonResponse {
  /** The original query */
  query: ComparisonQuery;
  /** The query value converted to base units */
  queryValueInBaseUnits: number;
  /** Ranked list of comparison results */
  results: ComparisonResult[];
}
