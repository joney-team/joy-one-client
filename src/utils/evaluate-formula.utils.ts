/**
 * Safely evaluate a user-defined formula with variables.
 * Only allows basic arithmetic operations and formulas starting with "=".
 *
 * Example:
 *   evaluateFormula("=3 * {a} + {b}", { a: 2, b: 5 }) -> 11
 */
export function evaluateFormula(
  formula: string,
  variables: Record<string, number> = {},
): number {
  // Ensure the formula starts with "="
  if (!formula.trim().startsWith('=')) {
    throw new Error("Formula must start with '='");
  }

  // Remove the "=" at the beginning
  const expression = formula.trim().slice(1);

  // Replace variables like {a}, {b} with their numeric values
  let parsed = expression.replace(/{(.*?)}/g, (_, name) => {
    if (!(name in variables)) {
      throw new Error(`Missing variable: ${name}`);
    }

    const value = variables[name];
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`Invalid value for variable: ${name}`);
    }

    return value.toString();
  });

  // Allow only numbers, basic math operators, parentheses, and spaces
  // Prevent code injection or unsafe characters
  if (!/^[\d+\-*/().\s]+$/.test(parsed)) {
    throw new Error(`Invalid characters detected in formula ${formula}`);
  }

  try {
    // Evaluate safely using Function in restricted scope
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${parsed})`);
    const result = fn();

    // Ensure result is a valid number
    if (typeof result !== 'number' || Number.isNaN(result)) {
      throw new Error('Formula did not produce a valid number');
    }

    // Round to 10 decimal places to avoid floating point precision issues
    // This handles cases like 55.00000000000001 -> 55
    return Math.round(result * 1e10) / 1e10;
  } catch {
    throw new Error('Invalid formula syntax');
  }
}
