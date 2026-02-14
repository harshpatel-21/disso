import type { GTG, EliminationStep, PathUpdate, Transition } from './types';
import { getTransitionsFrom, getTransitionsTo, getTransitionsBetween, getEliminatableStates, cloneGTG, generateId } from './nfa';
import { computeEliminationFormula, unionSymbols } from './regexUtils';

// Get the combined label for transitions between two states
function getCombinedLabel(gtg: GTG, from: string, to: string): string {
  const transitions = getTransitionsBetween(gtg, from, to);
  if (transitions.length === 0) return '∅';
  return unionSymbols(transitions.map(t => t.symbol));
}

// Generate all elimination steps
export function* stateEliminationGenerator(
  initialGTG: GTG,
  stateOrder?: string[]
): Generator<EliminationStep, void, undefined> {
  let currentGTG = cloneGTG(initialGTG);

  // Preprocessing step
  yield {
    type: 'preprocess',
    affectedPaths: [],
    explanation: 'Added new start state S and new final state F with ε-transitions.',
    gtgSnapshot: cloneGTG(currentGTG),
  };

  // Determine elimination order
  const eliminatable = stateOrder
    ? stateOrder
    : getEliminatableStates(currentGTG).map(s => s.id);

  for (const stateId of eliminatable) {
    const state = currentGTG.states.find(s => s.id === stateId);
    if (!state) continue;

    // Find predecessors and successors
    const incomingTransitions = getTransitionsTo(currentGTG, stateId);
    const outgoingTransitions = getTransitionsFrom(currentGTG, stateId);

    const predecessors = [...new Set(incomingTransitions.map(t => t.source))].filter(id => id !== stateId);
    const successors = [...new Set(outgoingTransitions.map(t => t.target))].filter(id => id !== stateId);

    // Self-loop
    const R2 = getCombinedLabel(currentGTG, stateId, stateId);

    const affectedPaths: PathUpdate[] = [];

    for (const pred of predecessors) {
      for (const succ of successors) {
        const R1 = getCombinedLabel(currentGTG, pred, stateId);
        const R3 = getCombinedLabel(currentGTG, stateId, succ);
        const R4 = getCombinedLabel(currentGTG, pred, succ);

        const expectedResult = computeEliminationFormula(R1, R2, R3, R4);

        affectedPaths.push({
          from: pred,
          to: succ,
          R1,
          R2,
          R3,
          R4,
          expectedResult,
        });
      }
    }

    yield {
      type: 'eliminate',
      stateToRemove: stateId,
      affectedPaths,
      explanation: `Eliminating state "${state.label}". Computing new transitions for ${affectedPaths.length} path(s).`,
      gtgSnapshot: cloneGTG(currentGTG),
    };

    // Apply the elimination: remove the state and update transitions
    // Remove all transitions involving the eliminated state
    currentGTG = {
      ...currentGTG,
      transitions: currentGTG.transitions.filter(
        t => t.source !== stateId && t.target !== stateId
      ),
      states: currentGTG.states.filter(s => s.id !== stateId),
    };

    // Add/update transitions for affected paths
    for (const path of affectedPaths) {
      // Remove existing transitions between pred and succ
      currentGTG = {
        ...currentGTG,
        transitions: currentGTG.transitions.filter(
          t => !(t.source === path.from && t.target === path.to)
        ),
      };

      // Add new combined transition (skip if result is ∅)
      if (path.expectedResult !== '∅') {
        const newTransition: Transition = {
          id: generateId(),
          source: path.from,
          target: path.to,
          symbol: path.expectedResult,
        };
        currentGTG = {
          ...currentGTG,
          transitions: [...currentGTG.transitions, newTransition],
        };
      }
    }
  }

  // Final step - extract the regex
  const startState = currentGTG.states.find(s => s.isStart);
  const finalState = currentGTG.states.find(s => s.isFinal);

  let finalRegex = '∅';
  if (startState && finalState) {
    finalRegex = getCombinedLabel(currentGTG, startState.id, finalState.id);
  }

  yield {
    type: 'complete',
    affectedPaths: [],
    explanation: `Conversion complete! The resulting regular expression is: ${finalRegex}`,
    gtgSnapshot: cloneGTG(currentGTG),
  };
}
