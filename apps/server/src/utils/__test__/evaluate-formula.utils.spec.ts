import { evaluateFormula } from '../evaluate-formula.utils';

describe('evaluateFormula', () => {
  describe('basic arithmetic operations', () => {
    it('should evaluate simple addition', () => {
      expect(evaluateFormula('=1+1', {})).toBe(2);
      expect(evaluateFormula('=5+10', {})).toBe(15);
    });

    it('should evaluate simple subtraction', () => {
      expect(evaluateFormula('=10-5', {})).toBe(5);
      expect(evaluateFormula('=100-50', {})).toBe(50);
    });

    it('should evaluate simple multiplication', () => {
      expect(evaluateFormula('=3*4', {})).toBe(12);
      expect(evaluateFormula('=7*8', {})).toBe(56);
    });

    it('should evaluate simple division', () => {
      expect(evaluateFormula('=10/2', {})).toBe(5);
      expect(evaluateFormula('=100/4', {})).toBe(25);
    });

    it('should evaluate complex expressions with multiple operations', () => {
      expect(evaluateFormula('=3+4*2', {})).toBe(11);
      expect(evaluateFormula('=10-5+3', {})).toBe(8);
      expect(evaluateFormula('=2*3+4*5', {})).toBe(26);
    });

    it('should respect operator precedence', () => {
      expect(evaluateFormula('=2+3*4', {})).toBe(14);
      expect(evaluateFormula('=10-2*3', {})).toBe(4);
    });

    it('should evaluate expressions with parentheses', () => {
      expect(evaluateFormula('=(2+3)*4', {})).toBe(20);
      expect(evaluateFormula('=(10-5)*2', {})).toBe(10);
      expect(evaluateFormula('=((2+3)*4)/2', {})).toBe(10);
    });

    it('should handle decimal numbers', () => {
      expect(evaluateFormula('=1.5+2.5', {})).toBe(4);
      expect(evaluateFormula('=3.14*2', {})).toBe(6.28);
      expect(evaluateFormula('=10.5/2', {})).toBe(5.25);
    });

    it('should handle negative numbers', () => {
      expect(evaluateFormula('=-5+10', {})).toBe(5);
      expect(evaluateFormula('=-10*2', {})).toBe(-20);
      expect(evaluateFormula('=5+-3', {})).toBe(2);
    });
  });

  describe('variable substitution', () => {
    it('should substitute single variable', () => {
      expect(evaluateFormula('={a}', { a: 5 })).toBe(5);
      expect(evaluateFormula('={x}', { x: 42 })).toBe(42);
    });

    it('should substitute multiple variables', () => {
      expect(evaluateFormula('={a}+{b}', { a: 3, b: 5 })).toBe(8);
      expect(evaluateFormula('={x}*{y}', { x: 4, y: 7 })).toBe(28);
    });

    it('should substitute variables in complex expressions', () => {
      expect(evaluateFormula('=3*{a}+{b}', { a: 2, b: 5 })).toBe(11);
      expect(
        evaluateFormula('={a}*{b}+{c}*{d}', { a: 2, b: 3, c: 4, d: 5 }),
      ).toBe(26);
    });

    it('should substitute variables with parentheses', () => {
      expect(evaluateFormula('=({a}+{b})*{c}', { a: 2, b: 3, c: 4 })).toBe(20);
      expect(evaluateFormula('={a}*({b}+{c})', { a: 2, b: 3, c: 5 })).toBe(16);
    });

    it('should handle variables with decimal values', () => {
      expect(
        evaluateFormula('={price}*{quantity}', { price: 9.99, quantity: 3 }),
      ).toBe(29.97);
      expect(
        evaluateFormula('={total}-{discount}', {
          total: 100.5,
          discount: 10.25,
        }),
      ).toBe(90.25);
    });

    it('should handle variables with zero values', () => {
      expect(evaluateFormula('={a}+{b}', { a: 0, b: 5 })).toBe(5);
      expect(evaluateFormula('={x}*{y}', { x: 10, y: 0 })).toBe(0);
    });
  });

  describe('whitespace handling', () => {
    it('should handle formulas with extra spaces', () => {
      expect(evaluateFormula('= 1 + 1 ', {})).toBe(2);
      expect(evaluateFormula('=  5  *  3  ', {})).toBe(15);
    });

    it('should handle variables with spaces', () => {
      expect(evaluateFormula('= {a} + {b} ', { a: 3, b: 5 })).toBe(8);
      expect(evaluateFormula('={a}  *  {b}', { a: 4, b: 6 })).toBe(24);
    });

    it('should trim formula before processing', () => {
      expect(evaluateFormula('  =1+1  ', {})).toBe(2);
      expect(evaluateFormula('\t=5*2\t', {})).toBe(10);
    });
  });

  describe('error handling - formula validation', () => {
    it('should throw error when formula does not start with =', () => {
      expect(() => evaluateFormula('1+1', {})).toThrow(
        "Formula must start with '='",
      );
      expect(() => evaluateFormula('5*3', {})).toThrow(
        "Formula must start with '='",
      );
      expect(() => evaluateFormula('', {})).toThrow(
        "Formula must start with '='",
      );
    });

    it('should throw error for missing variables', () => {
      expect(() => evaluateFormula('={a}+{b}', { a: 5 })).toThrow(
        'Missing variable: b',
      );
      expect(() => evaluateFormula('={x}', {})).toThrow('Missing variable: x');
    });

    it('should throw error for invalid variable values', () => {
      expect(() => evaluateFormula('={a}', { a: NaN })).toThrow(
        'Invalid value for variable: a',
      );
      expect(() => evaluateFormula('={x}+{y}', { x: 5, y: NaN })).toThrow(
        'Invalid value for variable: y',
      );
    });

    it('should throw error for non-number variable values', () => {
      expect(() => evaluateFormula('={a}', { a: 'string' as any })).toThrow(
        'Invalid value for variable: a',
      );
      expect(() => evaluateFormula('={x}', { x: null as any })).toThrow(
        'Invalid value for variable: x',
      );
      expect(() => evaluateFormula('={y}', { y: undefined as any })).toThrow(
        'Invalid value for variable: y',
      );
    });
  });

  describe('error handling - security and invalid characters', () => {
    it('should throw error for invalid characters', () => {
      expect(() => evaluateFormula('=alert(1)', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=console.log(1)', {})).toThrow(
        'Invalid characters detected in formula',
      );
    });

    it('should prevent code injection attempts', () => {
      expect(() => evaluateFormula('=1; alert("xss")', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=1 && alert(1)', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=1 || alert(1)', {})).toThrow(
        'Invalid characters detected in formula',
      );
    });

    it('should reject formulas with letters (except in variables)', () => {
      expect(() => evaluateFormula('=abc', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=1+x', {})).toThrow(
        'Invalid characters detected in formula',
      );
    });

    it('should reject formulas with special characters', () => {
      expect(() => evaluateFormula('=1$2', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=1@2', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=1#2', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('=1&2', {})).toThrow(
        'Invalid characters detected in formula',
      );
    });
  });

  describe('error handling - syntax errors', () => {
    it('should throw error for invalid syntax', () => {
      expect(() => evaluateFormula('=1++1', {})).toThrow(
        'Invalid formula syntax',
      );
      expect(() => evaluateFormula('=**5', {})).toThrow(
        'Invalid formula syntax',
      );
    });

    it('should throw error for unmatched parentheses', () => {
      expect(() => evaluateFormula('=(1+2', {})).toThrow(
        'Invalid formula syntax',
      );
      expect(() => evaluateFormula('=1+2)', {})).toThrow(
        'Invalid formula syntax',
      );
    });

    it('should throw error for empty expressions', () => {
      expect(() => evaluateFormula('=', {})).toThrow(
        'Invalid characters detected in formula',
      );
      expect(() => evaluateFormula('= ', {})).toThrow(
        'Invalid characters detected in formula',
      );
    });

    it('should throw error for trailing operators', () => {
      expect(() => evaluateFormula('=1+', {})).toThrow(
        'Invalid formula syntax',
      );
      expect(() => evaluateFormula('=5*', {})).toThrow(
        'Invalid formula syntax',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle division by zero', () => {
      const result = evaluateFormula('=1/0', {});
      expect(result).toBe(Infinity);
    });

    it('should handle very large numbers', () => {
      expect(evaluateFormula('=999999999*999999999', {})).toBe(
        999999999 * 999999999,
      );
    });

    it('should handle very small decimal numbers', () => {
      expect(evaluateFormula('=0.0001+0.0002', {})).toBeCloseTo(0.0003, 10);
    });

    it('should handle complex nested expressions', () => {
      expect(evaluateFormula('=((2+3)*(4-1))/(5+2)', {})).toBeCloseTo(
        15 / 7,
        10,
      );
    });

    it('should handle expressions with many variables', () => {
      const vars = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      expect(evaluateFormula('={a}+{b}+{c}+{d}+{e}', vars)).toBe(15);
      expect(evaluateFormula('={a}*{b}+{c}*{d}-{e}', vars)).toBe(
        1 * 2 + 3 * 4 - 5,
      );
    });

    it('should handle variable names with underscores and numbers', () => {
      expect(
        evaluateFormula('={var_1}+{var_2}', { var_1: 10, var_2: 20 }),
      ).toBe(30);
      expect(evaluateFormula('={price1}*{qty1}', { price1: 5, qty1: 3 })).toBe(
        15,
      );
    });

    it('should handle same variable used multiple times', () => {
      expect(evaluateFormula('={x}+{x}', { x: 5 })).toBe(10);
      expect(evaluateFormula('={a}*{a}+{a}', { a: 3 })).toBe(12);
    });
  });

  describe('real-world examples', () => {
    it('should calculate total price with tax', () => {
      const result = evaluateFormula('={price}*{quantity}*(1+{tax_rate})', {
        price: 10,
        quantity: 5,
        tax_rate: 0.1,
      });
      expect(result).toBe(55);
    });

    it('should calculate discount amount', () => {
      const result = evaluateFormula('={total}*{discount_percent}/100', {
        total: 200,
        discount_percent: 15,
      });
      expect(result).toBe(30);
    });

    it('should calculate final price after discount', () => {
      const result = evaluateFormula('={price}-({price}*{discount}/100)', {
        price: 100,
        discount: 20,
      });
      expect(result).toBe(80);
    });

    it('should calculate commission', () => {
      const result = evaluateFormula('={sales}*{commission_rate}/100', {
        sales: 5000,
        commission_rate: 5,
      });
      expect(result).toBe(250);
    });

    it('should calculate area of rectangle', () => {
      const result = evaluateFormula('={width}*{height}', {
        width: 10.5,
        height: 8.2,
      });
      expect(result).toBeCloseTo(86.1, 1);
    });
  });
});
