import type { NFA, State, Transition, GTG } from './types';

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create empty NFA
export function createEmptyNFA(): NFA {
  return { states: [], transitions: [], alphabet: [] };
}

// Add a state to the NFA
export function addState(nfa: NFA, label: string, isStart = false, isFinal = false): NFA {
  // If adding a start state, clear any existing start state
  const states = isStart
    ? nfa.states.map(s => ({ ...s, isStart: false }))
    : [...nfa.states];

  const newState: State = {
    id: generateId(),
    label,
    isStart,
    isFinal,
  };

  return { ...nfa, states: [...states, newState] };
}

// Remove a state and its associated transitions
export function removeState(nfa: NFA, stateId: string): NFA {
  return {
    ...nfa,
    states: nfa.states.filter(s => s.id !== stateId),
    transitions: nfa.transitions.filter(
      t => t.source !== stateId && t.target !== stateId
    ),
  };
}

// Add a transition
export function addTransition(nfa: NFA, source: string, target: string, symbol: string): NFA {
  const newTransition: Transition = {
    id: generateId(),
    source,
    target,
    symbol,
  };
  return { ...nfa, transitions: [...nfa.transitions, newTransition] };
}

// Remove a transition
export function removeTransition(nfa: NFA, transitionId: string): NFA {
  return {
    ...nfa,
    transitions: nfa.transitions.filter(t => t.id !== transitionId),
  };
}

// Get all transitions from a state
export function getTransitionsFrom(nfa: NFA, stateId: string): Transition[] {
  return nfa.transitions.filter(t => t.source === stateId);
}

// Get all transitions to a state
export function getTransitionsTo(nfa: NFA, stateId: string): Transition[] {
  return nfa.transitions.filter(t => t.target === stateId);
}

// Get transition between two states (may return multiple for NFA)
export function getTransitionsBetween(nfa: NFA, from: string, to: string): Transition[] {
  return nfa.transitions.filter(t => t.source === from && t.target === to);
}

// Find a state by label
export function findStateByLabel(nfa: NFA, label: string): State | undefined {
  return nfa.states.find(s => s.label === label);
}

// Get start state
export function getStartState(nfa: NFA): State | undefined {
  return nfa.states.find(s => s.isStart);
}

// Get final states
export function getFinalStates(nfa: NFA): State[] {
  return nfa.states.filter(s => s.isFinal);
}

// Convert NFA to GTG (collapse multiple transitions between same states into union)
export function nfaToGTG(nfa: NFA): GTG {
  const mergedTransitions: Transition[] = [];
  const seen = new Set<string>();

  for (const t of nfa.transitions) {
    const key = `${t.source}->${t.target}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const parallel = getTransitionsBetween(nfa, t.source, t.target);
    const symbols = parallel.map(p => p.symbol);
    const merged = symbols.length === 1 ? symbols[0] : symbols.join('+');

    mergedTransitions.push({
      id: generateId(),
      source: t.source,
      target: t.target,
      symbol: merged,
    });
  }

  return { ...nfa, transitions: mergedTransitions };
}

// Preprocess: add new unique start S and final F states
export function preprocessForElimination(nfa: NFA): GTG {
  const gtg = nfaToGTG(nfa);
  const oldStart = getStartState(gtg);
  const oldFinals = getFinalStates(gtg);

  if (!oldStart || oldFinals.length === 0) {
    throw new Error('NFA must have a start state and at least one final state');
  }

  const newStart: State = { id: generateId(), label: 'S', isStart: true, isFinal: false };
  const newFinal: State = { id: generateId(), label: 'F', isStart: false, isFinal: true };

  // Remove start/final flags from original states
  const updatedStates = gtg.states.map(s => ({
    ...s,
    isStart: false,
    isFinal: false,
  }));

  // Add ε-transition from new start to old start
  const newTransitions: Transition[] = [
    { id: generateId(), source: newStart.id, target: oldStart.id, symbol: 'ε' },
  ];

  // Add ε-transitions from old finals to new final
  for (const f of oldFinals) {
    newTransitions.push({
      id: generateId(),
      source: f.id,
      target: newFinal.id,
      symbol: 'ε',
    });
  }

  return {
    states: [newStart, ...updatedStates, newFinal],
    transitions: [...gtg.transitions, ...newTransitions],
    alphabet: gtg.alphabet,
  };
}

// Get non-start, non-final states (eliminatable)
export function getEliminatableStates(gtg: GTG): State[] {
  return gtg.states.filter(s => !s.isStart && !s.isFinal);
}

// Deep clone a GTG
export function cloneGTG(gtg: GTG): GTG {
  return JSON.parse(JSON.stringify(gtg));
}
