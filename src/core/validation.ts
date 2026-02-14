import type { NFA } from './types';
import { getStartState, getFinalStates } from './nfa';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateNFA(nfa: NFA): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Must have at least one state
  if (nfa.states.length === 0) {
    errors.push('NFA must have at least one state.');
    return { valid: false, errors, warnings };
  }

  // Must have exactly one start state
  const startState = getStartState(nfa);
  if (!startState) {
    errors.push('NFA must have exactly one start state.');
  }

  // Must have at least one final state
  const finalStates = getFinalStates(nfa);
  if (finalStates.length === 0) {
    errors.push('NFA must have at least one final state.');
  }

  // Check for duplicate labels
  const labels = nfa.states.map(s => s.label);
  const duplicates = labels.filter((l, i) => labels.indexOf(l) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate state labels: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Check that all transitions reference valid states
  const stateIds = new Set(nfa.states.map(s => s.id));
  for (const t of nfa.transitions) {
    if (!stateIds.has(t.source)) {
      errors.push(`Transition references non-existent source state: ${t.source}`);
    }
    if (!stateIds.has(t.target)) {
      errors.push(`Transition references non-existent target state: ${t.target}`);
    }
  }

  // Check for transitions with empty symbols
  for (const t of nfa.transitions) {
    if (!t.symbol || t.symbol.trim() === '') {
      errors.push(`Transition from ${t.source} to ${t.target} has an empty symbol.`);
    }
  }

  // Warnings: states with no transitions
  for (const s of nfa.states) {
    const hasTransitions = nfa.transitions.some(
      t => t.source === s.id || t.target === s.id
    );
    if (!hasTransitions && nfa.states.length > 1) {
      warnings.push(`State "${s.label}" has no transitions (isolated state).`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
