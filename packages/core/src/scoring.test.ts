import { describe, it, expect } from 'vitest';
import {
  calculateClosenessScore,
  calculateProximityScore,
  calculateNiceNumberMultiplier,
  calculateDirectionBoost,
  normalizeRelatability,
  normalizeAccuracy,
  normalizeWeights,
  calculateCompositeScore,
} from '@/scoring';

describe('calculateProximityScore', () => {
  it('returns 1 for exact match (ratio = 1)', () => {
    expect(calculateProximityScore(1)).toBe(1);
  });

  it('returns high score for near-exact match', () => {
    expect(calculateProximityScore(0.99)).toBeGreaterThan(0.95);
    expect(calculateProximityScore(1.01)).toBeGreaterThan(0.95);
  });

  it('decays as ratio moves away from 1', () => {
    const at1 = calculateProximityScore(1);
    const at2 = calculateProximityScore(2);
    const at5 = calculateProximityScore(5);
    const at10 = calculateProximityScore(10);
    const at100 = calculateProximityScore(100);

    expect(at1).toBeGreaterThan(at2);
    expect(at2).toBeGreaterThan(at5);
    expect(at5).toBeGreaterThan(at10);
    expect(at10).toBeGreaterThan(at100);
  });

  it('treats multiplicative distances symmetrically', () => {
    // 2x and 0.5x should have same proximity score
    expect(calculateProximityScore(2)).toBeCloseTo(calculateProximityScore(0.5), 5);
    expect(calculateProximityScore(10)).toBeCloseTo(calculateProximityScore(0.1), 5);
  });

  it('returns expected approximate values', () => {
    // Based on the formula: 1 / (1 + 2 * logDistance^1.5)
    expect(calculateProximityScore(2)).toBeCloseTo(0.75, 1);
    expect(calculateProximityScore(5)).toBeCloseTo(0.46, 1);
    expect(calculateProximityScore(10)).toBeCloseTo(0.33, 1);
  });

  it('returns 0 for invalid ratios', () => {
    expect(calculateProximityScore(0)).toBe(0);
    expect(calculateProximityScore(-1)).toBe(0);
  });
});

describe('calculateNiceNumberMultiplier', () => {
  it('returns 1 for exact match', () => {
    expect(calculateNiceNumberMultiplier(1)).toBe(1);
  });

  it('returns high multiplier for nice numbers', () => {
    expect(calculateNiceNumberMultiplier(2)).toBeGreaterThan(0.95);
    expect(calculateNiceNumberMultiplier(5)).toBeGreaterThan(0.95);
    expect(calculateNiceNumberMultiplier(10)).toBeGreaterThan(0.95);
    expect(calculateNiceNumberMultiplier(100)).toBeGreaterThan(0.95);
  });

  it('returns lower multiplier for ugly numbers', () => {
    const niceMultiplier = calculateNiceNumberMultiplier(10);
    const uglyMultiplier = calculateNiceNumberMultiplier(7.3);
    expect(uglyMultiplier).toBeLessThan(niceMultiplier);
  });

  it('treats reciprocals equally', () => {
    expect(calculateNiceNumberMultiplier(2)).toBeCloseTo(calculateNiceNumberMultiplier(0.5), 5);
    expect(calculateNiceNumberMultiplier(10)).toBeCloseTo(calculateNiceNumberMultiplier(0.1), 5);
  });

  it('has a floor of 0.6', () => {
    // Even the ugliest number shouldn't go below 0.6
    expect(calculateNiceNumberMultiplier(7.3)).toBeGreaterThanOrEqual(0.6);
    expect(calculateNiceNumberMultiplier(13.7)).toBeGreaterThanOrEqual(0.6);
  });
});

describe('calculateDirectionBoost', () => {
  it('returns 1 for ratio = 1', () => {
    expect(calculateDirectionBoost(1)).toBe(1);
  });

  it('returns 1 for ratios < 1', () => {
    expect(calculateDirectionBoost(0.5)).toBe(1);
    expect(calculateDirectionBoost(0.1)).toBe(1);
  });

  it('returns small boost for ratios > 1', () => {
    expect(calculateDirectionBoost(2)).toBeGreaterThan(1);
    expect(calculateDirectionBoost(10)).toBeGreaterThan(1);
  });

  it('caps boost at 1.05', () => {
    expect(calculateDirectionBoost(1000000)).toBeLessThanOrEqual(1.05);
  });

  it('gives larger ratios slightly more boost', () => {
    expect(calculateDirectionBoost(10)).toBeGreaterThan(calculateDirectionBoost(2));
  });
});

describe('calculateClosenessScore', () => {
  it('returns 1 for perfect match (ratio = 1)', () => {
    expect(calculateClosenessScore(1)).toBe(1);
  });

  it('returns very high scores for near-exact matches', () => {
    expect(calculateClosenessScore(0.99)).toBeGreaterThan(0.9);
    expect(calculateClosenessScore(1.01)).toBeGreaterThan(0.9);
  });

  it('near-exact match beats distant nice number', () => {
    // This is the key fix: 0.99 (near 1) should beat 0.2 (near 1/5)
    const nearExact = calculateClosenessScore(0.99);
    const distantNice = calculateClosenessScore(0.2);
    expect(nearExact).toBeGreaterThan(distantNice);

    // More specifically, the gap should be significant
    expect(nearExact - distantNice).toBeGreaterThan(0.5);
  });

  it('ugly numbers score lower than nice numbers at same distance', () => {
    // Both ~3x away from 1, but 3 is nice and 3.7 is not
    const nice = calculateClosenessScore(3);
    const ugly = calculateClosenessScore(3.7);
    expect(nice).toBeGreaterThan(ugly);
  });

  it('returns lower scores for distant ratios', () => {
    const close = calculateClosenessScore(2);
    const far = calculateClosenessScore(100);
    expect(close).toBeGreaterThan(far);
  });

  it('gives slight preference to ratios > 1', () => {
    // 1.2x should score slightly higher than 0.8x (same distance from 1)
    const above = calculateClosenessScore(1.2);
    const below = calculateClosenessScore(1 / 1.2);
    expect(above).toBeGreaterThan(below);
  });

  it('returns 0 for invalid ratios', () => {
    expect(calculateClosenessScore(0)).toBe(0);
    expect(calculateClosenessScore(-1)).toBe(0);
  });

  it('handles very large ratios', () => {
    // Should still return a reasonable (small) score
    const score = calculateClosenessScore(1000000);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.1);
  });

  it('handles very small ratios', () => {
    const score = calculateClosenessScore(0.000001);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.1);
  });
});

describe('normalizeRelatability', () => {
  it('maps 1 to 0', () => {
    expect(normalizeRelatability(1)).toBe(0);
  });

  it('maps 10 to 1', () => {
    expect(normalizeRelatability(10)).toBe(1);
  });

  it('maps 5 to 0.444...', () => {
    expect(normalizeRelatability(5)).toBeCloseTo(4 / 9, 5);
  });

  it('clamps values outside range', () => {
    expect(normalizeRelatability(0)).toBe(0);
    expect(normalizeRelatability(11)).toBe(1);
  });
});

describe('normalizeAccuracy', () => {
  it('maps 1 to 0', () => {
    expect(normalizeAccuracy(1)).toBe(0);
  });

  it('maps 10 to 1', () => {
    expect(normalizeAccuracy(10)).toBe(1);
  });
});

describe('normalizeWeights', () => {
  it('returns default weights when no input', () => {
    const weights = normalizeWeights();
    expect(weights.closeness + weights.relatability + weights.accuracy).toBeCloseTo(1);
  });

  it('normalizes custom weights to sum to 1', () => {
    const weights = normalizeWeights({
      closeness: 2,
      relatability: 1,
      accuracy: 1,
    });
    expect(weights.closeness).toBeCloseTo(0.5);
    expect(weights.relatability).toBeCloseTo(0.25);
    expect(weights.accuracy).toBeCloseTo(0.25);
  });

  it('fills in missing weights with defaults', () => {
    const weights = normalizeWeights({ closeness: 0.5 });
    expect(weights.closeness).toBeDefined();
    expect(weights.relatability).toBeDefined();
    expect(weights.accuracy).toBeDefined();
  });
});

describe('calculateCompositeScore', () => {
  it('returns weighted average', () => {
    const score = calculateCompositeScore(
      1, // closeness
      10, // relatability (maps to 1)
      10, // accuracy (maps to 1)
      { closeness: 1, relatability: 1, accuracy: 1 }
    );
    expect(score).toBeCloseTo(1);
  });

  it('returns 0 when all inputs are minimum', () => {
    const score = calculateCompositeScore(
      0,
      1, // maps to 0
      1 // maps to 0
    );
    expect(score).toBe(0);
  });

  it('respects weight distribution', () => {
    const closenessHeavy = calculateCompositeScore(1, 1, 1, {
      closeness: 1,
      relatability: 0,
      accuracy: 0,
    });
    expect(closenessHeavy).toBeCloseTo(1);

    const relatabilityHeavy = calculateCompositeScore(0, 10, 1, {
      closeness: 0,
      relatability: 1,
      accuracy: 0,
    });
    expect(relatabilityHeavy).toBeCloseTo(1);
  });
});
