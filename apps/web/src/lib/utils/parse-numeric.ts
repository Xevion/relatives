/**
 * Parse numeric expressions including scientific notation, suffixes, and power notation
 * @param input - The string to parse
 * @returns The parsed number or null if invalid
 */
export function parseNumericExpression(input: string): number | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Empty string
  if (trimmed === "") {
    return null;
  }

  // Remove commas (thousands separators)
  const withoutCommas = trimmed.replace(/,/g, "");

  // Handle power notation: 2^10 -> 1024
  const powerMatch = withoutCommas.match(/^(-?[\d.]+)\s*\^\s*(-?[\d.]+)$/);
  if (powerMatch) {
    const base = parseFloat(powerMatch[1]);
    const exponent = parseFloat(powerMatch[2]);
    if (!isNaN(base) && !isNaN(exponent)) {
      const result = Math.pow(base, exponent);
      return isFinite(result) ? result : null;
    }
  }

  // Handle suffix notation: 5k, 2.5M, 1B, 3T
  const suffixMatch = withoutCommas.match(/^(-?[\d.]+)\s*([kmbtKMBT])$/);
  if (suffixMatch) {
    const value = parseFloat(suffixMatch[1]);
    const suffix = suffixMatch[2].toLowerCase();

    if (isNaN(value)) {
      return null;
    }

    const multipliers: Record<string, number> = {
      k: 1e3,
      m: 1e6,
      b: 1e9,
      t: 1e12,
    };

    const result = value * multipliers[suffix];
    return isFinite(result) ? result : null;
  }

  // Handle scientific notation: 1e10, 2.5E6, 1E-3
  // parseFloat handles this natively
  const parsed = parseFloat(withoutCommas);

  // Check if valid number
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Check if a string is a valid numeric expression
 */
export function isValidNumericExpression(input: string): boolean {
  return parseNumericExpression(input) !== null;
}
