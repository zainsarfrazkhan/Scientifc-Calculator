import { create, all } from 'mathjs';
import { physicalConstants } from '../data/constants';

// Create a custom mathjs instance
const math = create(all);

/**
 * Normalizes input expressions to mathjs-compatible strings
 */
export function normalizeExpression(expr: string): string {
  let normalized = expr;

  // Replace typographic characters with standard operators
  normalized = normalized.replace(/×/g, '*');
  normalized = normalized.replace(/÷/g, '/');
  normalized = normalized.replace(/−/g, '-');
  normalized = normalized.replace(/π/g, 'pi');
  normalized = normalized.replace(/φ/g, 'phi');
  normalized = normalized.replace(/√\(/g, 'sqrt(');
  normalized = normalized.replace(/³√\(/g, 'cbrt(');

  // Map user-friendly logarithm button representations to mathjs functions
  // Replace log( first with log10, then replace ln( with log
  normalized = normalized.replace(/log\(/g, 'log10(');
  normalized = normalized.replace(/ln\(/g, 'log(');

  // Handle implicit multiplication for constants (e.g. 2pi -> 2 * pi, 2e -> 2 * e)
  normalized = normalized.replace(/(\d+)(pi|e|phi|c|h|G|g|N_A|k|R)/gi, '$1 * $2');

  // Fix custom constants representation
  normalized = normalized.replace(/e_charge/g, '1.602176634e-19');

  return normalized;
}

/**
 * Safely evaluates algebraic expressions using mathjs
 */
export function evaluateExpression(
  expression: string,
  options: {
    isDegree: boolean;
    ans?: number;
  }
): { success: boolean; result: string; numericValue?: number; error?: string } {
  try {
    const normalized = normalizeExpression(expression);

    // Build scientific scope
    const scope: Record<string, any> = {
      ans: options.ans ?? 0,
      pi: Math.PI,
      phi: 1.618033988749895,
      e: Math.E,
    };

    // Inject physical constants into the evaluation scope
    physicalConstants.forEach(c => {
      // Map symbols cleanly
      const key = c.symbol === 'π' ? 'pi' : c.symbol === 'φ' ? 'phi' : c.symbol === 'e_charge' ? 'e_charge' : c.symbol;
      scope[key] = c.value;
    });

    let resultVal: any;

    if (options.isDegree) {
      // Redefine trig functions for degrees mode
      const dToR = (x: number) => (x * Math.PI) / 180;
      const rToD = (x: number) => (x * 180) / Math.PI;

      // Wrap standard functions with degrees conversion helpers
      const degreesScope = {
        ...scope,
        sin: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return math.sin(dToR(num as number));
        },
        cos: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return math.cos(dToR(num as number));
        },
        tan: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          // Handle tan(90) which is undefined/infinity
          if (Math.abs((num as number) % 180) === 90) {
            throw new Error('Undefined (Tan 90°)');
          }
          return math.tan(dToR(num as number));
        },
        asin: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return rToD(math.asin(num as number) as number);
        },
        acos: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return rToD(math.acos(num as number) as number);
        },
        atan: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return rToD(math.atan(num as number) as number);
        },
        sinh: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return math.sinh(num as number);
        },
        cosh: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return math.cosh(num as number);
        },
        tanh: (x: any) => {
          const num = typeof x === 'number' ? x : math.number(x);
          return math.tanh(num as number);
        },
      };

      resultVal = math.evaluate(normalized, degreesScope);
    } else {
      resultVal = math.evaluate(normalized, scope);
    }

    if (resultVal === undefined || resultVal === null) {
      return { success: false, result: '', error: 'Invalid Expression' };
    }

    // Format output based on representation
    if (typeof resultVal === 'function') {
      return { success: false, result: '', error: 'Incomplete Function' };
    }

    // If result is matrix or subset
    if (resultVal && typeof resultVal === 'object' && 'toArray' in resultVal) {
      const arr = resultVal.toArray();
      return {
        success: true,
        result: JSON.stringify(arr),
        numericValue: NaN
      };
    }

    const num = Number(resultVal);
    if (!isNaN(num)) {
      // Format number nicely
      let formatted = '';
      if (Math.abs(num) < 1e-9 || Math.abs(num) > 1e12) {
        if (num === 0) formatted = '0';
        else formatted = num.toExponential(8);
      } else {
        // Round to avoid IEEE 754 precision issues (e.g. 0.1 + 0.2 = 0.300000000004)
        formatted = String(parseFloat(num.toFixed(10)));
      }
      return { success: true, result: formatted, numericValue: num };
    }

    return { success: true, result: String(resultVal) };
  } catch (err: any) {
    return { success: false, result: '', error: err.message || 'Error' };
  }
}
