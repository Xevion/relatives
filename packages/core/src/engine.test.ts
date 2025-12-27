import { describe, it, expect } from 'vitest';
import { compare, ComparisonEngine } from '@/engine';

describe('ComparisonEngine', () => {
  describe('compare', () => {
    it('finds comparisons for human hair thickness', () => {
      const result = compare({
        value: 70,
        unit: 'micrometer',
        dimension: 'length',
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.queryValueInBaseUnits).toBeCloseTo(70e-6);

      // Human hair should be a top result (it's exactly 70 micrometers)
      const hairResult = result.results.find((r) => r.measurable.id === 'human-hair-thickness');
      expect(hairResult).toBeDefined();
      expect(hairResult!.ratio).toBeCloseTo(1);
      expect(hairResult!.closenessScore).toBe(1);
    });

    it('calculates correct ratios', () => {
      const result = compare({
        value: 140,
        unit: 'micrometer',
        dimension: 'length',
      });

      const hairResult = result.results.find((r) => r.measurable.id === 'human-hair-thickness');
      expect(hairResult).toBeDefined();
      // 140 / 70 = 2
      expect(hairResult!.ratio).toBeCloseTo(2);
    });

    it('handles unit conversions', () => {
      const result = compare({
        value: 1,
        unit: 'kilometer',
        dimension: 'length',
      });

      // Query is 1 km = 1000 m
      expect(result.queryValueInBaseUnits).toBe(1000);

      // Should find marathon (42.195 km) as a potential match
      const marathonResult = result.results.find((r) => r.measurable.id === 'marathon-distance');
      expect(marathonResult).toBeDefined();
    });

    it('applies tag filters - exclude', () => {
      const withAmerican = compare({
        value: 100,
        unit: 'meter',
        dimension: 'length',
      });

      const withoutAmerican = compare({
        value: 100,
        unit: 'meter',
        dimension: 'length',
        filters: { excludeTags: ['american'] },
      });

      // Football field is tagged american, should be excluded
      const hasFootballWith = withAmerican.results.some(
        (r) => r.measurable.id === 'football-field-length'
      );
      const hasFootballWithout = withoutAmerican.results.some(
        (r) => r.measurable.id === 'football-field-length'
      );

      expect(hasFootballWith).toBe(true);
      expect(hasFootballWithout).toBe(false);
    });

    it('applies tag filters - include', () => {
      const result = compare({
        value: 100,
        unit: 'meter',
        dimension: 'length',
        filters: { includeTags: ['sports'] },
      });

      // All results should have sports tag
      for (const r of result.results) {
        expect(r.measurable.tags).toContain('sports');
      }
    });

    it('uses intelligent cutoff by default', () => {
      const result = compare({
        value: 1,
        unit: 'meter',
        dimension: 'length',
      });

      // Should have at least minResults (5)
      expect(result.results.length).toBeGreaterThanOrEqual(5);

      // Should have at most maxResults (50)
      expect(result.results.length).toBeLessThanOrEqual(50);
    });

    it('works with mass dimension', () => {
      const result = compare({
        value: 70,
        unit: 'kilogram',
        dimension: 'mass',
      });

      expect(result.results.length).toBeGreaterThan(0);

      // Adult human is ~70 kg
      const humanResult = result.results.find((r) => r.measurable.id === 'adult-human');
      expect(humanResult).toBeDefined();
      expect(humanResult!.ratio).toBeCloseTo(1);
    });

    it('works with time dimension', () => {
      const result = compare({
        value: 1,
        unit: 'year',
        dimension: 'time',
      });

      expect(result.results.length).toBeGreaterThan(0);

      // Earth orbit is exactly 1 year
      const orbitResult = result.results.find((r) => r.measurable.id === 'earth-orbit');
      expect(orbitResult).toBeDefined();
      expect(orbitResult!.ratio).toBeCloseTo(1);
    });

    it('sorts results by composite score descending', () => {
      const result = compare({
        value: 1,
        unit: 'meter',
        dimension: 'length',
      });

      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i - 1].compositeScore).toBeGreaterThanOrEqual(
          result.results[i].compositeScore
        );
      }
    });

    it('throws for unknown dimension', () => {
      expect(() =>
        compare({
          value: 1,
          unit: 'meter',
          dimension: 'unknown',
        })
      ).toThrow('Unknown dimension');
    });

    it('throws for unknown unit', () => {
      expect(() =>
        compare({
          value: 1,
          unit: 'unknown',
          dimension: 'length',
        })
      ).toThrow('Unknown unit');
    });

    it('applies custom weights', () => {
      // With high relatability weight, more relatable items should rank higher
      const highRelatability = compare({
        value: 1,
        unit: 'kilometer',
        dimension: 'length',
        weights: { relatability: 1, closeness: 0, accuracy: 0 },
      });

      // All top results should have high relatability
      for (const r of highRelatability.results.slice(0, 5)) {
        expect(r.measurable.relatability).toBeGreaterThanOrEqual(8);
      }
    });
  });
});

describe('ResultCutoff', () => {
  it('applies default cutoff when no config provided', () => {
    const result = compare({
      value: 1,
      unit: 'meter',
      dimension: 'length',
    });

    // Should have at least minResults (5)
    expect(result.results.length).toBeGreaterThanOrEqual(5);

    // Should have at most maxResults (50)
    expect(result.results.length).toBeLessThanOrEqual(50);

    // All results should meet thresholds (except guaranteed minimum)
    const topScore = result.results[0].compositeScore;
    for (let i = 5; i < result.results.length; i++) {
      const score = result.results[i].compositeScore;
      const meetsAbsolute = score >= 0.15;
      const meetsRelative = score >= topScore * 0.2;
      expect(meetsAbsolute || meetsRelative).toBe(true);
    }
  });

  it('respects custom minScore', () => {
    const result = compare({
      value: 1,
      unit: 'meter',
      dimension: 'length',
      cutoff: { minScore: 0.5, minResults: 0, minRelativeScore: 0 },
    });

    // All results should have score >= 0.5
    for (const r of result.results) {
      expect(r.compositeScore).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('respects custom minRelativeScore', () => {
    const result = compare({
      value: 1,
      unit: 'meter',
      dimension: 'length',
      cutoff: { minRelativeScore: 0.5, minScore: 0, minResults: 0 },
    });

    if (result.results.length > 0) {
      const topScore = result.results[0].compositeScore;
      for (const r of result.results) {
        expect(r.compositeScore).toBeGreaterThanOrEqual(topScore * 0.5);
      }
    }
  });

  it('always includes minResults even with low scores', () => {
    const result = compare({
      value: 1e20, // Absurdly large value - will have poor matches
      unit: 'meter',
      dimension: 'length',
      cutoff: { minResults: 10, minScore: 0.99, minRelativeScore: 0.99 }, // Impossible thresholds
    });

    // Should still return 10 results despite impossible thresholds
    expect(result.results.length).toBe(10);
  });

  it('respects maxResults safety limit', () => {
    const result = compare({
      value: 1,
      unit: 'meter',
      dimension: 'length',
      cutoff: { maxResults: 3, minScore: 0, minRelativeScore: 0 },
    });

    expect(result.results.length).toBeLessThanOrEqual(3);
  });

  it('respects custom maxResults in cutoff', () => {
    const result = compare({
      value: 1,
      unit: 'meter',
      dimension: 'length',
      cutoff: { maxResults: 7, minScore: 0, minRelativeScore: 0 },
    });

    expect(result.results.length).toBe(7);
  });
});

describe('compare convenience function', () => {
  it('works the same as engine.compare', () => {
    const engine = new ComparisonEngine();
    const query = { value: 100, unit: 'meter', dimension: 'length' };

    const result1 = compare(query);
    const result2 = engine.compare(query);

    expect(result1.results.length).toBe(result2.results.length);
    expect(result1.results[0].measurable.id).toBe(result2.results[0].measurable.id);
  });
});
