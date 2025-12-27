import { describe, it, expect } from 'vitest';
import {
  getDimension,
  getUnit,
  getUnitInDimension,
  toBaseUnit,
  fromBaseUnit,
  convert,
} from '@/dimensions';

describe('getDimension', () => {
  it('returns dimension by id', () => {
    const length = getDimension('length');
    expect(length).toBeDefined();
    expect(length!.name).toBe('Length / Distance');
    expect(length!.baseUnit).toBe('meter');
  });

  it('returns undefined for unknown dimension', () => {
    expect(getDimension('unknown')).toBeUndefined();
  });
});

describe('getUnit', () => {
  it('finds unit across dimensions', () => {
    const result = getUnit('kilometer');
    expect(result).toBeDefined();
    expect(result!.unit.symbol).toBe('km');
    expect(result!.dimension.id).toBe('length');
  });

  it('returns undefined for unknown unit', () => {
    expect(getUnit('unknown')).toBeUndefined();
  });
});

describe('getUnitInDimension', () => {
  it('finds unit in specific dimension', () => {
    const unit = getUnitInDimension('length', 'kilometer');
    expect(unit).toBeDefined();
    expect(unit!.toBase).toBe(1000);
  });

  it('returns undefined for wrong dimension', () => {
    expect(getUnitInDimension('mass', 'kilometer')).toBeUndefined();
  });
});

describe('toBaseUnit', () => {
  it('converts kilometers to meters', () => {
    expect(toBaseUnit(5, 'kilometer')).toBe(5000);
  });

  it('converts centimeters to meters', () => {
    expect(toBaseUnit(100, 'centimeter')).toBe(1);
  });

  it('converts pounds to kilograms', () => {
    expect(toBaseUnit(1, 'pound')).toBeCloseTo(0.4536);
  });

  it('returns undefined for unknown unit', () => {
    expect(toBaseUnit(1, 'unknown')).toBeUndefined();
  });
});

describe('fromBaseUnit', () => {
  it('converts meters to kilometers', () => {
    expect(fromBaseUnit(5000, 'kilometer')).toBe(5);
  });

  it('converts meters to centimeters', () => {
    expect(fromBaseUnit(1, 'centimeter')).toBe(100);
  });
});

describe('convert', () => {
  it('converts between units in same dimension', () => {
    expect(convert(1, 'kilometer', 'meter')).toBe(1000);
    expect(convert(1000, 'meter', 'kilometer')).toBe(1);
  });

  it('converts miles to kilometers', () => {
    expect(convert(1, 'mile', 'kilometer')).toBeCloseTo(1.609344);
  });

  it('returns undefined for mismatched dimensions', () => {
    expect(convert(1, 'kilometer', 'kilogram')).toBeUndefined();
  });

  it('returns undefined for unknown units', () => {
    expect(convert(1, 'unknown', 'meter')).toBeUndefined();
    expect(convert(1, 'meter', 'unknown')).toBeUndefined();
  });
});
