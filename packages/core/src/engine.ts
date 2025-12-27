import type { ComparisonQuery, ComparisonResponse, ComparisonResult, Measurable } from '@/types';
import { getDimension, getUnitInDimension } from '@/dimensions';
import { getMeasurablesByDimension } from '@/measurables';
import { calculateClosenessScore, calculateCompositeScore } from '@/scoring';

/**
 * The main comparison engine
 */
export class ComparisonEngine {
  /**
   * Find comparisons for a given query
   */
  compare(query: ComparisonQuery): ComparisonResponse {
    const { value, unit, dimension, filters, weights, limit = 10 } = query;

    // Validate dimension exists
    const dim = getDimension(dimension);
    if (!dim) {
      throw new Error(`Unknown dimension: ${dimension}`);
    }

    // Validate unit exists in dimension
    const unitDef = getUnitInDimension(dimension, unit);
    if (!unitDef) {
      throw new Error(`Unknown unit '${unit}' in dimension '${dimension}'`);
    }

    // Convert query value to base units
    const queryValueInBaseUnits = value * unitDef.toBase;

    // Get all measurables for this dimension
    let measurables = getMeasurablesByDimension(dimension);

    // Apply tag filters
    if (filters?.includeTags?.length) {
      measurables = measurables.filter((m) =>
        filters.includeTags!.every((tag) => m.tags.includes(tag))
      );
    }
    if (filters?.excludeTags?.length) {
      measurables = measurables.filter(
        (m) => !filters.excludeTags!.some((tag) => m.tags.includes(tag))
      );
    }

    // Calculate scores for each measurable
    const results: ComparisonResult[] = measurables.map((measurable) => {
      const measurableValueInBase = this.toBaseUnits(measurable, dimension);
      const ratio = queryValueInBaseUnits / measurableValueInBase;
      const closenessScore = calculateClosenessScore(ratio);
      const compositeScore = calculateCompositeScore(
        closenessScore,
        measurable.relatability,
        measurable.accuracy,
        weights
      );

      return {
        measurable,
        ratio,
        closenessScore,
        compositeScore,
      };
    });

    // Sort by composite score (descending)
    results.sort((a, b) => b.compositeScore - a.compositeScore);

    // Limit results
    const limitedResults = results.slice(0, limit);

    return {
      query,
      queryValueInBaseUnits,
      results: limitedResults,
    };
  }

  /**
   * Convert a measurable's value to base units of its dimension
   */
  private toBaseUnits(measurable: Measurable, dimensionId: string): number {
    const unitDef = getUnitInDimension(dimensionId, measurable.unit);
    if (!unitDef) {
      throw new Error(`Unknown unit '${measurable.unit}' for measurable '${measurable.id}'`);
    }
    return measurable.value * unitDef.toBase;
  }
}

/**
 * Convenience function to create an engine and run a comparison
 */
export function compare(query: ComparisonQuery): ComparisonResponse {
  const engine = new ComparisonEngine();
  return engine.compare(query);
}
