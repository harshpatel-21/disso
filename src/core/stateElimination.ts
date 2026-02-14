import type { GTG, State, StateId, EliminationStep, PathUpdate } from './types'
import { EPSILON, EMPTY_SET } from './types'
import {
  cloneNFA,
  generateStateId,
  generateTransitionId,
  getIncomingTransitions,
  getOutgoingTransitions,
  getSelfLoops,
  getTransitionBetween,
} from './nfa'
import { eliminationFormula, union } from './regexUtils'

/**
 * Preprocess: add new unique start state S and final state F.
 * - S has ε-transition to original start
 * - All original final states get ε-transition to F
 * - Original start loses isStart, original finals lose isFinal
 */
export function preprocess(gtg: GTG): { gtg: GTG; step: EliminationStep } {
  const before = cloneNFA(gtg)

  const newStartId = generateStateId()
  const newFinalId = generateStateId()

  const newStart: State = {
    id: newStartId,
    label: 'S',
    isStart: true,
    isFinal: false,
  }
  const newFinal: State = {
    id: newFinalId,
    label: 'F',
    isStart: false,
    isFinal: true,
  }

  const originalStart = gtg.states.find((s) => s.isStart)
  const originalFinals = gtg.states.filter((s) => s.isFinal)

  // Build new states: new start + new final + originals with flags cleared
  const updatedStates = gtg.states.map((s) => ({
    ...s,
    isStart: false,
    isFinal: false,
  }))

  // Build new transitions
  const newTransitions = [...gtg.transitions]

  // S → original start with ε
  if (originalStart) {
    newTransitions.push({
      id: generateTransitionId(),
      source: newStartId,
      target: originalStart.id,
      symbol: EPSILON,
    })
  }

  // Each original final → F with ε
  for (const finalState of originalFinals) {
    newTransitions.push({
      id: generateTransitionId(),
      source: finalState.id,
      target: newFinalId,
      symbol: EPSILON,
    })
  }

  const after: GTG = {
    states: [newStart, ...updatedStates, newFinal],
    transitions: newTransitions,
    alphabet: [...gtg.alphabet],
  }

  const step: EliminationStep = {
    type: 'preprocess',
    affectedPaths: [],
    explanation: `Added new start state S with ε-transition to ${originalStart?.label ?? '?'}, and new final state F with ε-transitions from all original accept states.`,
    gtgBefore: before,
    gtgAfter: cloneNFA(after),
  }

  return { gtg: after, step }
}

/**
 * Compute the PathUpdates that result from eliminating a state.
 * For each (predecessor, successor) pair routed through the state:
 *   R1 = transition from predecessor → state
 *   R2 = self-loop on state (∅ if none, union if multiple)
 *   R3 = transition from state → successor
 *   R4 = existing direct transition predecessor → successor (∅ if none)
 *   expectedResult = eliminationFormula(R1, R2, R3, R4)
 */
export function computePathUpdates(
  gtg: GTG,
  stateId: StateId
): PathUpdate[] {
  const incoming = getIncomingTransitions(gtg, stateId).filter(
    (t) => t.source !== stateId
  )
  const outgoing = getOutgoingTransitions(gtg, stateId).filter(
    (t) => t.target !== stateId
  )
  const selfLoops = getSelfLoops(gtg, stateId)

  // R2: self-loop expression
  const R2 =
    selfLoops.length === 0
      ? EMPTY_SET
      : selfLoops.map((t) => t.symbol).reduce((a, b) => union(a, b))

  const pathUpdates: PathUpdate[] = []

  for (const inc of incoming) {
    for (const out of outgoing) {
      const R1 = inc.symbol
      const R3 = out.symbol

      // R4: existing direct transition from predecessor to successor
      const directTransition = getTransitionBetween(
        gtg,
        inc.source,
        out.target
      )
      const R4 = directTransition ? directTransition.symbol : EMPTY_SET

      const expected = eliminationFormula(R1, R2, R3, R4)

      pathUpdates.push({
        from: inc.source,
        to: out.target,
        R1,
        R2,
        R3,
        R4,
        expectedResult: expected,
      })
    }
  }

  return pathUpdates
}

/**
 * Apply an elimination step to the GTG:
 * - For each PathUpdate, set/update the direct transition with the expected result
 * - Remove the eliminated state and all its transitions
 */
export function applyElimination(
  gtg: GTG,
  stateId: StateId,
  pathUpdates: PathUpdate[]
): GTG {
  let result = cloneNFA(gtg)

  // First, apply all path updates (add/update direct transitions)
  for (const update of pathUpdates) {
    const existing = getTransitionBetween(result, update.from, update.to)
    if (existing) {
      // Update existing transition with the new computed expression
      result = {
        ...result,
        transitions: result.transitions.map((t) =>
          t.id === existing.id
            ? { ...t, symbol: update.expectedResult }
            : t
        ),
      }
    } else {
      // Add new transition
      result = {
        ...result,
        transitions: [
          ...result.transitions,
          {
            id: generateTransitionId(),
            source: update.from,
            target: update.to,
            symbol: update.expectedResult,
          },
        ],
      }
    }
  }

  // Remove the eliminated state and all its transitions
  result = {
    ...result,
    states: result.states.filter((s) => s.id !== stateId),
    transitions: result.transitions.filter(
      (t) => t.source !== stateId && t.target !== stateId
    ),
  }

  return result
}

/**
 * Extract the final regex from a GTG with only start and final states.
 */
export function extractFinalRegex(gtg: GTG): string {
  const startState = gtg.states.find((s) => s.isStart)
  const finalState = gtg.states.find((s) => s.isFinal)

  if (!startState || !finalState) {
    return EMPTY_SET
  }

  const transition = getTransitionBetween(gtg, startState.id, finalState.id)
  return transition ? transition.symbol : EMPTY_SET
}

/**
 * Get the list of eliminable states (all except new start S and new final F).
 */
export function getEliminableStates(gtg: GTG): State[] {
  return gtg.states.filter((s) => !s.isStart && !s.isFinal)
}

/**
 * Generator that yields each step of the state elimination process.
 */
export function* stateEliminationGenerator(
  inputGtg: GTG,
  eliminationOrder?: StateId[]
): Generator<EliminationStep, string, void> {
  // Step 1: Preprocess
  const { gtg: preprocessed, step: preprocessStep } = preprocess(inputGtg)
  yield preprocessStep

  let currentGtg = preprocessed

  // Determine elimination order
  const order =
    eliminationOrder ?? getEliminableStates(currentGtg).map((s) => s.id)

  // Step 2: Eliminate states one by one
  for (const stateId of order) {
    const state = currentGtg.states.find((s) => s.id === stateId)
    if (!state) continue

    const before = cloneNFA(currentGtg)
    const pathUpdates = computePathUpdates(currentGtg, stateId)
    currentGtg = applyElimination(currentGtg, stateId, pathUpdates)

    const step: EliminationStep = {
      type: 'eliminate',
      stateToRemove: stateId,
      affectedPaths: pathUpdates,
      explanation: `Eliminated state ${state.label}. Updated ${pathUpdates.length} path(s).`,
      gtgBefore: before,
      gtgAfter: cloneNFA(currentGtg),
    }

    yield step
  }

  // Step 3: Extract final regex
  const finalRegex = extractFinalRegex(currentGtg)

  const extractStep: EliminationStep = {
    type: 'extract',
    affectedPaths: [],
    explanation: `Final regex: ${finalRegex}`,
    gtgBefore: cloneNFA(currentGtg),
    gtgAfter: cloneNFA(currentGtg),
  }

  yield extractStep

  return finalRegex
}
