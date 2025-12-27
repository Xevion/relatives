import type {
  ComparisonQuery,
  ComparisonResponse,
  ComparisonResult,
  Measurable,
  ResultCutoff,
} from '@/types';
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
    const { value, unit, dimension, filters, weights, cutoff } = query;

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

    // Apply intelligent cutoff (hybrid strategy)
    const filteredResults = this.applyCutoff(results, cutoff);

    return {
      query,
      queryValueInBaseUnits,
      results: filteredResults,
    };
  }

  /**
   * Apply intelligent cutoff to results using hybrid strategy
   * @param results - Sorted results (descending by compositeScore)
   * @param cutoff - Cutoff configuration
   */
  private applyCutoff(results: ComparisonResult[], cutoff?: ResultCutoff): ComparisonResult[] {
    // Default cutoff values (hybrid strategy)
    // Use explicit undefined checks to allow 0 values
    const config = {
      minScore: cutoff?.minScore !== undefined ? cutoff.minScore : 0.15,
      minRelativeScore: cutoff?.minRelativeScore !== undefined ? cutoff.minRelativeScore : 0.2,
      minResults: cutoff?.minResults !== undefined ? cutoff.minResults : 5,
      maxResults: cutoff?.maxResults !== undefined ? cutoff.maxResults : 50,
    };

    if (results.length === 0) return [];

    // Ensure we return at least minResults (but not more than available)
    const guaranteedCount = Math.min(config.minResults, results.length);

    const topScore = results[0]?.compositeScore ?? 0;

    const filtered: ComparisonResult[] = [];

    for (let i = 0; i < results.length; i++) {
      // Stop if we've hit maxResults
      if (filtered.length >= config.maxResults) {
        break;
      }

      const result = results[i];

      // Always include minimum results (even if they're bad)
      if (i < guaranteedCount) {
        filtered.push(result);
        continue;
      }

      // Include if meets absolute threshold
      if (result.compositeScore >= config.minScore) {
        filtered.push(result);
        continue;
      }

      // Include if meets relative threshold (% of top score)
      // Skip this check if minRelativeScore is 0 (otherwise all results pass since score >= 0)
      if (
        config.minRelativeScore > 0 &&
        result.compositeScore >= topScore * config.minRelativeScore
      ) {
        filtered.push(result);
        continue;
      }

      // Otherwise skip this result
    }

    return filtered;
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
