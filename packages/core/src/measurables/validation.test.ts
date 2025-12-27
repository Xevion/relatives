import { describe, it, expect } from 'vitest';
import { dimensions } from '@/dimensions';
import { measurablesByDimension, allMeasurables } from '@/measurables';
import type { Measurable } from '@/types';

describe('Measurable Validation', () => {
  describe('Unit Existence', () => {
    it('all measurables must reference valid units in their dimensions', () => {
      const errors: string[] = [];

      for (const [dimensionId, measurables] of Object.entries(measurablesByDimension)) {
        const dimension = dimensions[dimensionId];

        if (!dimension) {
          errors.push(`Dimension '${dimensionId}' not found in dimensions registry`);
          continue;
        }

        const validUnitIds = new Set(dimension.units.map((u) => u.id));

        for (const measurable of measurables) {
          if (!validUnitIds.has(measurable.unit)) {
            errors.push(
              `Measurable '${measurable.id}' (${measurable.name}) uses unknown unit '${measurable.unit}' in dimension '${dimensionId}'`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with invalid units:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Dimension Reference', () => {
    it('all measurables must reference valid dimensions', () => {
      const errors: string[] = [];
      const validDimensionIds = new Set(Object.keys(dimensions));

      for (const measurable of allMeasurables) {
        if (!validDimensionIds.has(measurable.dimension)) {
          errors.push(
            `Measurable '${measurable.id}' references non-existent dimension '${measurable.dimension}'`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with invalid dimension references:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('measurables in dimension files must match their declared dimension', () => {
      const errors: string[] = [];

      for (const [dimensionId, measurables] of Object.entries(measurablesByDimension)) {
        for (const measurable of measurables) {
          if (measurable.dimension !== dimensionId) {
            errors.push(
              `Measurable '${measurable.id}' is in '${dimensionId}' file but declares dimension '${measurable.dimension}'`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) in wrong dimension files:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Required Fields', () => {
    it('all measurables must have required fields', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        const missing: string[] = [];

        if (!measurable.id) missing.push('id');
        if (!measurable.name) missing.push('name');
        if (!measurable.dimension) missing.push('dimension');
        if (measurable.value === undefined || measurable.value === null) missing.push('value');
        if (!measurable.unit) missing.push('unit');
        if (!measurable.tags) missing.push('tags');
        if (measurable.relatability === undefined || measurable.relatability === null) {
          missing.push('relatability');
        }
        if (measurable.accuracy === undefined || measurable.accuracy === null) {
          missing.push('accuracy');
        }

        if (missing.length > 0) {
          errors.push(
            `Measurable '${measurable.id || '(no id)'}' missing fields: ${missing.join(', ')}`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with missing required fields:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('all measurables must have at least one tag', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        if (!measurable.tags || measurable.tags.length === 0) {
          errors.push(`Measurable '${measurable.id}' has no tags`);
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) without tags:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Value Integrity', () => {
    it('relatability scores must be between 1 and 10', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        if (measurable.relatability < 1 || measurable.relatability > 10) {
          errors.push(
            `Measurable '${measurable.id}' has invalid relatability ${measurable.relatability} (must be 1-10)`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with invalid relatability scores:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('accuracy scores must be between 1 and 10', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        if (measurable.accuracy < 1 || measurable.accuracy > 10) {
          errors.push(
            `Measurable '${measurable.id}' has invalid accuracy ${measurable.accuracy} (must be 1-10)`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with invalid accuracy scores:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('value must be positive (except temperature which allows negative)', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        // Temperature can have negative values (Celsius, Fahrenheit)
        if (measurable.dimension !== 'temperature' && measurable.value <= 0) {
          errors.push(`Measurable '${measurable.id}' has non-positive value ${measurable.value}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with non-positive values:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('value must be within min/max range when specified', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        if (measurable.valueMin !== undefined && measurable.value < measurable.valueMin) {
          errors.push(
            `Measurable '${measurable.id}' has value ${measurable.value} < valueMin ${measurable.valueMin}`
          );
        }

        if (measurable.valueMax !== undefined && measurable.value > measurable.valueMax) {
          errors.push(
            `Measurable '${measurable.id}' has value ${measurable.value} > valueMax ${measurable.valueMax}`
          );
        }

        if (
          measurable.valueMin !== undefined &&
          measurable.valueMax !== undefined &&
          measurable.valueMin > measurable.valueMax
        ) {
          errors.push(
            `Measurable '${measurable.id}' has valueMin ${measurable.valueMin} > valueMax ${measurable.valueMax}`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with invalid value ranges:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('valueMin and valueMax must be positive when specified (except temperature)', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        // Temperature can have negative min/max values (Celsius, Fahrenheit)
        if (measurable.dimension !== 'temperature') {
          if (measurable.valueMin !== undefined && measurable.valueMin <= 0) {
            errors.push(
              `Measurable '${measurable.id}' has non-positive valueMin ${measurable.valueMin}`
            );
          }

          if (measurable.valueMax !== undefined && measurable.valueMax <= 0) {
            errors.push(
              `Measurable '${measurable.id}' has non-positive valueMax ${measurable.valueMax}`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with non-positive min/max values:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Unique Identifiers', () => {
    it('measurable IDs must be globally unique', () => {
      const errors: string[] = [];
      const idCount = new Map<string, Measurable[]>();

      for (const measurable of allMeasurables) {
        if (!idCount.has(measurable.id)) {
          idCount.set(measurable.id, []);
        }
        idCount.get(measurable.id)!.push(measurable);
      }

      for (const [id, measurables] of idCount) {
        if (measurables.length > 1) {
          const dimensions = measurables.map((m) => m.dimension).join(', ');
          errors.push(
            `ID '${id}' is used ${measurables.length} times (in dimensions: ${dimensions})`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} duplicate measurable ID(s):\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('measurables should not have duplicate tags', () => {
      const errors: string[] = [];

      for (const measurable of allMeasurables) {
        const tagSet = new Set<string>();
        const duplicates: string[] = [];

        for (const tag of measurable.tags) {
          if (tagSet.has(tag)) {
            duplicates.push(tag);
          } else {
            tagSet.add(tag);
          }
        }

        if (duplicates.length > 0) {
          errors.push(`Measurable '${measurable.id}' has duplicate tags: ${duplicates.join(', ')}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with duplicate tags:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Tag Naming Conventions', () => {
    it('tags must be lowercase kebab-case', () => {
      const errors: string[] = [];
      const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

      for (const measurable of allMeasurables) {
        for (const tag of measurable.tags) {
          if (!kebabCaseRegex.test(tag)) {
            errors.push(
              `Measurable '${measurable.id}' has invalid tag '${tag}' (must be lowercase kebab-case)`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} measurable(s) with invalid tag names:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });
});

describe('Dimension Validation', () => {
  describe('Base Unit Integrity', () => {
    it('all dimensions must have valid base units', () => {
      const errors: string[] = [];

      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        const validUnitIds = new Set(dimension.units.map((u) => u.id));

        if (!validUnitIds.has(dimension.baseUnit)) {
          errors.push(
            `Dimension '${dimensionId}' has baseUnit '${dimension.baseUnit}' which is not in its units array`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} dimension(s) with invalid base units:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Unit Naming', () => {
    it('unit IDs must be unique within each dimension', () => {
      const errors: string[] = [];

      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        const unitIdCount = new Map<string, number>();

        for (const unit of dimension.units) {
          unitIdCount.set(unit.id, (unitIdCount.get(unit.id) || 0) + 1);
        }

        for (const [unitId, count] of unitIdCount) {
          if (count > 1) {
            errors.push(
              `Dimension '${dimensionId}' has duplicate unit ID '${unitId}' (${count} times)`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} dimension(s) with duplicate unit IDs:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('unit symbols must be unique within each dimension', () => {
      const errors: string[] = [];

      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        const symbolCount = new Map<string, string[]>();

        for (const unit of dimension.units) {
          if (!symbolCount.has(unit.symbol)) {
            symbolCount.set(unit.symbol, []);
          }
          symbolCount.get(unit.symbol)!.push(unit.id);
        }

        for (const [symbol, unitIds] of symbolCount) {
          if (unitIds.length > 1) {
            errors.push(
              `Dimension '${dimensionId}' has duplicate symbol '${symbol}' for units: ${unitIds.join(', ')}`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} dimension(s) with duplicate unit symbols:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Unit Conversion', () => {
    it('all units must have positive conversion factors', () => {
      const errors: string[] = [];

      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        for (const unit of dimension.units) {
          if (unit.toBase <= 0) {
            errors.push(
              `Dimension '${dimensionId}' unit '${unit.id}' has non-positive toBase value: ${unit.toBase}`
            );
          }

          if (!Number.isFinite(unit.toBase)) {
            errors.push(
              `Dimension '${dimensionId}' unit '${unit.id}' has invalid toBase value: ${unit.toBase}`
            );
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} unit(s) with invalid conversion factors:\n  - ${errors.join('\n  - ')}`
        );
      }
    });

    it('base unit must have toBase = 1', () => {
      const errors: string[] = [];

      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        const baseUnit = dimension.units.find((u) => u.id === dimension.baseUnit);

        if (baseUnit && baseUnit.toBase !== 1) {
          errors.push(
            `Dimension '${dimensionId}' base unit '${dimension.baseUnit}' has toBase = ${baseUnit.toBase} (must be 1)`
          );
        }
      }

      if (errors.length > 0) {
        throw new Error(
          `Found ${errors.length} dimension(s) with incorrect base unit conversion:\n  - ${errors.join('\n  - ')}`
        );
      }
    });
  });

  describe('Unused Units', () => {
    it('warns about units that are never used by measurables', () => {
      const usedUnits = new Map<string, Set<string>>();

      // Track which units are actually used
      for (const measurable of allMeasurables) {
        if (!usedUnits.has(measurable.dimension)) {
          usedUnits.set(measurable.dimension, new Set());
        }
        usedUnits.get(measurable.dimension)!.add(measurable.unit);
      }

      const warnings: string[] = [];

      for (const [dimensionId, dimension] of Object.entries(dimensions)) {
        const used = usedUnits.get(dimensionId) || new Set();

        for (const unit of dimension.units) {
          if (!used.has(unit.id)) {
            warnings.push(
              `Dimension '${dimensionId}' has unused unit '${unit.id}' (${unit.symbol})`
            );
          }
        }
      }

      // This is informational - we don't fail the test, just log warnings
      if (warnings.length > 0) {
        console.warn(
          `\nFound ${warnings.length} unused unit(s):\n  - ${warnings.join('\n  - ')}\n`
        );
      }
    });
  });
});
