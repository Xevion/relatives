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

    it('respects limit parameter', () => {
      const result = compare({
        value: 1,
        unit: 'meter',
        dimension: 'length',
        limit: 5,
      });

      expect(result.results.length).toBeLessThanOrEqual(5);
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
        limit: 20,
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
        limit: 50,
      });

      // All top results should have high relatability
      for (const r of highRelatability.results.slice(0, 5)) {
        expect(r.measurable.relatability).toBeGreaterThanOrEqual(8);
      }
    });
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
