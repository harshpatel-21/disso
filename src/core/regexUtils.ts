// Compute the elimination formula: R4 + (R1 · R2* · R3)
export function computeEliminationFormula(
  R1: string,
  R2: string,
  R3: string,
  R4: string
): string {
  // Handle empty set cases
  if (R1 === '∅' || R3 === '∅') {
    return R4 === '∅' ? '∅' : R4;
  }

  // Compute R2* part
  let r2Star: string;
  if (R2 === '∅') {
    r2Star = 'ε';
  } else if (R2 === 'ε') {
    r2Star = 'ε';
  } else {
    r2Star = needsParens(R2) ? `(${R2})*` : `${R2}*`;
  }

  // Compute R1 · R2* · R3
  const parts: string[] = [];
  if (R1 !== 'ε') parts.push(R1);
  if (r2Star !== 'ε') parts.push(r2Star);
  if (R3 !== 'ε') parts.push(R3);

  const concatenated = parts.length === 0 ? 'ε' : parts.join('');

  // Combine with R4
  if (R4 === '∅') {
    return concatenated;
  }

  if (concatenated === '∅') {
    return R4;
  }

  if (R4 === concatenated) {
    return R4;
  }

  return `${R4}+${concatenated}`;
}

// Check if expression needs parentheses for star operation
function needsParens(expr: string): boolean {
  if (expr.length <= 1) return false;
  if (expr.includes('+')) return true;
  // Already has outermost parens
  if (expr.startsWith('(') && expr.endsWith(')') && isBalancedParens(expr)) return false;
  return true;
}

// Check if the string has balanced outermost parentheses
function isBalancedParens(expr: string): boolean {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') depth++;
    if (expr[i] === ')') depth--;
    if (depth === 0 && i < expr.length - 1) return false;
  }
  return depth === 0;
}

// Normalize a regex string for comparison
export function normalizeRegex(expr: string): string {
  return expr.replace(/\s+/g, '').replace(/·/g, '');
}

// Compare user input against expected result
export function validateUserInput(userInput: string, expected: string): boolean {
  return normalizeRegex(userInput) === normalizeRegex(expected);
}

// Get the combined symbol for parallel transitions (union)
export function unionSymbols(symbols: string[]): string {
  const filtered = symbols.filter(s => s !== '∅');
  if (filtered.length === 0) return '∅';
  if (filtered.length === 1) return filtered[0];
  return filtered.join('+');
}
