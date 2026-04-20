import { describe, it, expect, beforeEach } from 'vitest'
import {
  preprocess,
  computePathUpdates,
  applyElimination,
  extractFinalRegex,
  getEliminableStates,
} from '../stateElimination'
import { resetCounters } from '../nfa'
import type { GTG } from '../types'
import { EPSILON, EMPTY_SET } from '../types'

beforeEach(() => {
  resetCounters()
})

// ---- Shared GTG builders ----

/** Easy: 2-state NFA accepts exactly "a" — q0 --a--> q1 */
function makeEasyGTG(): GTG {
  return {
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false },
      { id: 'q1', label: 'q1', isStart: false, isFinal: true },
    ],
    transitions: [{ id: 't0', source: 'q0', target: 'q1', symbol: 'a' }],
    alphabet: ['a'],
  }
}

/** Medium: 3-state NFA accepts "ab" — q0 --a--> q1 --b--> q2 */
function makeMediumGTG(): GTG {
  return {
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false },
      { id: 'q1', label: 'q1', isStart: false, isFinal: false },
      { id: 'q2', label: 'q2', isStart: false, isFinal: true },
    ],
    transitions: [
      { id: 't0', source: 'q0', target: 'q1', symbol: 'a' },
      { id: 't1', source: 'q1', target: 'q2', symbol: 'b' },
    ],
    alphabet: ['a', 'b'],
  }
}

/** Hard: 3-state NFA accepts "a+b" — q0 --a--> q1, q0 --b--> q2, q1 and q2 are final */
function makeHardGTG(): GTG {
  return {
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false },
      { id: 'q1', label: 'q1', isStart: false, isFinal: true },
      { id: 'q2', label: 'q2', isStart: false, isFinal: true },
    ],
    transitions: [
      { id: 't0', source: 'q0', target: 'q1', symbol: 'a' },
      { id: 't1', source: 'q0', target: 'q2', symbol: 'b' },
    ],
    alphabet: ['a', 'b'],
  }
}

/**
 * Very Hard: NFA accepts "a*b+" (= a*bb* after elimination)
 * q0 (start, self-loop a) --b--> q1 (final, self-loop b)
 */
function makeVeryHardGTG(): GTG {
  return {
    states: [
      { id: 'q0', label: 'q0', isStart: true, isFinal: false },
      { id: 'q1', label: 'q1', isStart: false, isFinal: true },
    ],
    transitions: [
      { id: 't0', source: 'q0', target: 'q0', symbol: 'a' },
      { id: 't1', source: 'q0', target: 'q1', symbol: 'b' },
      { id: 't2', source: 'q1', target: 'q1', symbol: 'b' },
    ],
    alphabet: ['a', 'b'],
  }
}

// ---- Helper: run full elimination until only S and F remain ----
function fullyEliminate(gtg: GTG): string {
  let g = preprocess(gtg).gtg
  let eliminable = getEliminableStates(g)
  while (eliminable.length > 0) {
    const stateToRemove = eliminable[0]!
    const updates = computePathUpdates(g, stateToRemove.id)
    g = applyElimination(g, stateToRemove.id, updates)
    eliminable = getEliminableStates(g)
  }
  return extractFinalRegex(g)
}

// ---- preprocess ----

describe('preprocess', () => {
  it('adds a new start state S and final state F', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const start = gtg.states.find(s => s.isStart)
    const final = gtg.states.find(s => s.isFinal)
    expect(start?.label).toBe('S')
    expect(final?.label).toBe('F')
  })

  it('original start/final flags are cleared', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const q0 = gtg.states.find(s => s.id === 'q0')!
    const q1 = gtg.states.find(s => s.id === 'q1')!
    expect(q0.isStart).toBe(false)
    expect(q1.isFinal).toBe(false)
  })

  it('adds ε-transition from S to original start', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const S = gtg.states.find(s => s.isStart)!
    const sToQ0 = gtg.transitions.find(t => t.source === S.id && t.target === 'q0')
    expect(sToQ0?.symbol).toBe(EPSILON)
  })

  it('adds ε-transition from original final(s) to F', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const F = gtg.states.find(s => s.isFinal)!
    const q1ToF = gtg.transitions.find(t => t.source === 'q1' && t.target === F.id)
    expect(q1ToF?.symbol).toBe(EPSILON)
  })

  it('adds ε-transitions for all original final states (multi-final NFA)', () => {
    const { gtg } = preprocess(makeHardGTG())
    const F = gtg.states.find(s => s.isFinal)!
    const toF = gtg.transitions.filter(t => t.target === F.id)
    expect(toF).toHaveLength(2)
  })

  it('returns a step record of type preprocess', () => {
    const { step } = preprocess(makeEasyGTG())
    expect(step.type).toBe('preprocess')
  })
})

// ---- getEliminableStates ----

describe('getEliminableStates', () => {
  it('returns all non-start, non-final states', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const eliminable = getEliminableStates(gtg)
    const labels = eliminable.map(s => s.label)
    expect(labels).toContain('q0')
    expect(labels).toContain('q1')
    expect(labels).not.toContain('S')
    expect(labels).not.toContain('F')
  })
})

// ---- computePathUpdates ----

describe('computePathUpdates — easy NFA', () => {
  it('returns one path update for the single predecessor/successor pair', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const updates = computePathUpdates(gtg, 'q0')
    expect(updates).toHaveLength(1)
  })

  it('R1=ε, R2=∅, R3=a, R4=∅ → expectedResult=a', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const [update] = computePathUpdates(gtg, 'q0')!
    expect(update!.R1).toBe(EPSILON)
    expect(update!.R2).toBe(EMPTY_SET)
    expect(update!.R3).toBe('a')
    expect(update!.R4).toBe(EMPTY_SET)
    expect(update!.expectedResult).toBe('a')
  })
})

describe('computePathUpdates — very hard NFA (self-loop)', () => {
  it('incorporates self-loop as R2 when eliminating q0', () => {
    const { gtg } = preprocess(makeVeryHardGTG())
    const updates = computePathUpdates(gtg, 'q0')
    expect(updates).toHaveLength(1)
    const [u] = updates
    expect(u!.R2).toBe('a')
    expect(u!.expectedResult).toBe('a*b')
  })
})

// ---- applyElimination ----

describe('applyElimination', () => {
  it('removes the eliminated state from the GTG', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const updates = computePathUpdates(gtg, 'q0')
    const result = applyElimination(gtg, 'q0', updates)
    expect(result.states.map(s => s.id)).not.toContain('q0')
  })

  it('removes all transitions involving the eliminated state', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const updates = computePathUpdates(gtg, 'q0')
    const result = applyElimination(gtg, 'q0', updates)
    expect(result.transitions.every(t => t.source !== 'q0' && t.target !== 'q0')).toBe(true)
  })

  it('adds or updates a direct transition for each path update', () => {
    const { gtg } = preprocess(makeEasyGTG())
    const S = gtg.states.find(s => s.isStart)!
    const updates = computePathUpdates(gtg, 'q0')
    const result = applyElimination(gtg, 'q0', updates)
    const direct = result.transitions.find(t => t.source === S.id && t.target === 'q1')
    expect(direct?.symbol).toBe('a')
  })
})

// ---- extractFinalRegex ----

describe('extractFinalRegex', () => {
  it('returns ∅ when no S→F transition exists', () => {
    const gtg: GTG = {
      states: [
        { id: 'S', label: 'S', isStart: true, isFinal: false },
        { id: 'F', label: 'F', isStart: false, isFinal: true },
      ],
      transitions: [],
      alphabet: [],
    }
    expect(extractFinalRegex(gtg)).toBe(EMPTY_SET)
  })

  it('returns the symbol on the S→F transition', () => {
    const gtg: GTG = {
      states: [
        { id: 'S', label: 'S', isStart: true, isFinal: false },
        { id: 'F', label: 'F', isStart: false, isFinal: true },
      ],
      transitions: [{ id: 't', source: 'S', target: 'F', symbol: 'ab*' }],
      alphabet: ['a', 'b'],
    }
    expect(extractFinalRegex(gtg)).toBe('ab*')
  })
})

// ---- End-to-end elimination ----

describe('full state elimination pipeline', () => {
  it('easy — NFA accepting "a" produces regex "a"', () => {
    expect(fullyEliminate(makeEasyGTG())).toBe('a')
  })

  it('medium — NFA accepting "ab" produces regex "ab"', () => {
    expect(fullyEliminate(makeMediumGTG())).toBe('ab')
  })

  it('hard — NFA accepting "a+b" produces regex "a+b"', () => {
    expect(fullyEliminate(makeHardGTG())).toBe('a+b')
  })

  it('very hard — NFA accepting "a*b+" produces regex "a*bb*"', () => {
    expect(fullyEliminate(makeVeryHardGTG())).toBe('a*bb*')
  })
})
