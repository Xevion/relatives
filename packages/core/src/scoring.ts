import type { ScoringWeights } from '@/types';

/**
 * Default weights for scoring
 */
export const DEFAULT_WEIGHTS: Required<ScoringWeights> = {
  closeness: 0.4,
  relatability: 0.35,
  accuracy: 0.25,
};

/**
 * "Nice" numbers that are easy to express in natural language.
 * These are the ideal ratio values (and their reciprocals).
 */
const NICE_NUMBERS = [
  1, 2, 3, 4, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 100000, 1000000,
];

/**
 * Calculate how close a ratio is to 1 (exact match).
 * Uses log-scale so multiplicative distances are treated equally.
 *
 * @param ratio - The ratio (query / measurable)
 * @returns Score from 0 to 1, where 1 is exact match
 */
export function calculateProximityScore(ratio: number): number {
  if (ratio <= 0) return 0;
  if (ratio === 1) return 1;

  // Log distance from 1 (so 2x and 0.5x have the same distance)
  const logDistance = Math.abs(Math.log10(ratio));

  // Decay curve: score = 1 / (1 + k * logDistance^p)
  // With k=2, p=1.5:
  //   ratio 1.0  -> score 1.0
  //   ratio 2.0  -> score ~0.63
  //   ratio 5.0  -> score ~0.34
  //   ratio 10.0 -> score ~0.22
  //   ratio 100  -> score ~0.08
  const k = 2;
  const p = 1.5;
  return 1 / (1 + k * Math.pow(logDistance, p));
}

/**
 * Calculate a multiplier based on how "nice" (expressible) the ratio is.
 * Nice ratios are ones easy to say: "twice as big", "ten times larger", etc.
 *
 * @param ratio - The ratio (query / measurable)
 * @returns Multiplier from 0.6 to 1.0
 */
export function calculateNiceNumberMultiplier(ratio: number): number {
  if (ratio <= 0) return 0.6;

  // Normalize to >= 1 (we treat 2x and 0.5x equivalently for "niceness")
  const normalizedRatio = ratio >= 1 ? ratio : 1 / ratio;

  if (normalizedRatio === 1) return 1;

  // Find the closest nice number
  let minLogDistance = Infinity;

  for (const nice of NICE_NUMBERS) {
    const logDistance = Math.abs(Math.log10(normalizedRatio) - Math.log10(nice));
    if (logDistance < minLogDistance) {
      minLogDistance = logDistance;
    }
  }

  // Convert log distance to multiplier (0.6 to 1.0 range)
  // logDistance 0 -> multiplier 1.0
  // logDistance 0.15 (about 40% off from nice) -> multiplier ~0.7
  // logDistance 0.3+ -> multiplier 0.6 (floor)
  const multiplier = Math.max(0.6, 1 - minLogDistance * 1.5);

  return multiplier;
}

/**
 * Small boost for ratios > 1 (e.g., "1.2x" is slightly preferable to "0.8x")
 *
 * @param ratio - The ratio (query / measurable)
 * @returns Multiplier from 1.0 to 1.05
 */
export function calculateDirectionBoost(ratio: number): number {
  if (ratio <= 0) return 1;
  if (ratio >= 1) {
    // Small boost for "X times larger" vs "1/X the size"
    // Caps at 1.05 (5% boost max)
    return Math.min(1.05, 1 + 0.02 * Math.log10(ratio));
  }
  return 1;
}

/**
 * Calculate how "nice" a ratio is for human understanding.
 *
 * Uses a two-factor approach:
 * 1. Proximity score: How close is the ratio to 1 (exact match)?
 * 2. Nice number multiplier: Is the ratio expressible (2x, 10x, 100x)?
 * 3. Direction boost: Small preference for ratios > 1
 *
 * @param ratio - The ratio between query value and measurable value
 * @returns A score from 0 to 1, where 1 is a perfect match
 */
export function calculateClosenessScore(ratio: number): number {
  if (ratio <= 0) return 0;

  const proximity = calculateProximityScore(ratio);
  const niceMultiplier = calculateNiceNumberMultiplier(ratio);
  const directionBoost = calculateDirectionBoost(ratio);

  // Combine factors (cap at 1.0)
  return Math.min(1, proximity * niceMultiplier * directionBoost);
}

/**
 * Normalize a relatability value (1-10) to a 0-1 score
 */
export function normalizeRelatability(relatability: number): number {
  return Math.max(0, Math.min(1, (relatability - 1) / 9));
}

/**
 * Normalize an accuracy value (1-10) to a 0-1 score
 */
export function normalizeAccuracy(accuracy: number): number {
  return Math.max(0, Math.min(1, (accuracy - 1) / 9));
}

/**
 * Normalize weights to sum to 1
 */
export function normalizeWeights(weights: ScoringWeights = {}): Required<ScoringWeights> {
  const w = {
    closeness: weights.closeness ?? DEFAULT_WEIGHTS.closeness,
    relatability: weights.relatability ?? DEFAULT_WEIGHTS.relatability,
    accuracy: weights.accuracy ?? DEFAULT_WEIGHTS.accuracy,
  };

  const sum = w.closeness + w.relatability + w.accuracy;
  if (sum === 0) return DEFAULT_WEIGHTS;

  return {
    closeness: w.closeness / sum,
    relatability: w.relatability / sum,
    accuracy: w.accuracy / sum,
  };
}

/**
 * Calculate the composite score for a comparison
 */
export function calculateCompositeScore(
  closenessScore: number,
  relatability: number,
  accuracy: number,
  weights: ScoringWeights = {}
): number {
  const normalizedWeights = normalizeWeights(weights);
  const relatabilityScore = normalizeRelatability(relatability);
  const accuracyScore = normalizeAccuracy(accuracy);

  return (
    normalizedWeights.closeness * closenessScore +
    normalizedWeights.relatability * relatabilityScore +
    normalizedWeights.accuracy * accuracyScore
  );
}
