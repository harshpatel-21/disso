import { describe, it, expect } from 'vitest'
import { buildThompsonSteps } from '../thompson'
import { EPSILON } from '../types'

// buildThompsonSteps resets its own counters on each call.

describe('buildThompsonSteps — error handling', () => {
  it('returns an error for an empty string', () => {
    const { steps, error } = buildThompsonSteps('')
    expect(steps).toHaveLength(0)
    expect(error).toBeDefined()
  })

  it('returns an error for an invalid character', () => {
    const { error } = buildThompsonSteps('@')
    expect(error).toBeDefined()
  })

  it('returns an error for unmatched parenthesis', () => {
    const { error } = buildThompsonSteps('(ab')
    expect(error).toBeDefined()
  })
})

// ---- Easy: single symbol ----

describe('easy — single symbol "a"', () => {
  it('produces exactly 1 step', () => {
    const { steps } = buildThompsonSteps('a')
    expect(steps).toHaveLength(1)
  })

  it('step has template "symbol" and subExpr "a"', () => {
    const { steps } = buildThompsonSteps('a')
    expect(steps[0]!.template).toBe('symbol')
    expect(steps[0]!.subExpr).toBe('a')
  })

  it('final NFA has 2 states and 1 transition labelled "a"', () => {
    const { steps } = buildThompsonSteps('a')
    const nfa = steps[0]!.nfaAfter
    expect(nfa.states).toHaveLength(2)
    expect(nfa.transitions).toHaveLength(1)
    expect(nfa.transitions[0]!.symbol).toBe('a')
  })

  it('alphabet contains "a"', () => {
    const { steps } = buildThompsonSteps('a')
    expect(steps.at(-1)!.nfaAfter.alphabet).toContain('a')
  })

  it('fragment start and final IDs differ (two distinct states)', () => {
    const { steps } = buildThompsonSteps('a')
    expect(steps[0]!.fragmentStartId).not.toBe(steps[0]!.fragmentFinalId)
  })
})

// ---- Easy: epsilon ----

describe('easy — epsilon "ε"', () => {
  it('produces 1 step with template "epsilon"', () => {
    const { steps } = buildThompsonSteps(EPSILON)
    expect(steps).toHaveLength(1)
    expect(steps[0]!.template).toBe('epsilon')
  })

  it('final NFA has 2 states and 1 ε-transition', () => {
    const { steps } = buildThompsonSteps(EPSILON)
    const nfa = steps[0]!.nfaAfter
    expect(nfa.states).toHaveLength(2)
    expect(nfa.transitions[0]!.symbol).toBe(EPSILON)
  })
})

// ---- Medium: concatenation ----

describe('medium — concatenation "ab"', () => {
  it('produces 3 steps: symbol a, symbol b, concat', () => {
    const { steps } = buildThompsonSteps('ab')
    expect(steps).toHaveLength(3)
    expect(steps[0]!.template).toBe('symbol')
    expect(steps[1]!.template).toBe('symbol')
    expect(steps[2]!.template).toBe('concat')
  })

  it('concat step covers the full expression', () => {
    const { steps } = buildThompsonSteps('ab')
    expect(steps[2]!.subExpr).toBe('ab')
  })

  it('concat step adds exactly 1 new ε-transition and 0 new states', () => {
    const { steps } = buildThompsonSteps('ab')
    expect(steps[2]!.newStateIds).toHaveLength(0)
    expect(steps[2]!.newTransitionIds).toHaveLength(1)
    expect(steps[2]!.expectedTransitions[0]!.symbol).toBe(EPSILON)
  })

  it('final NFA has 4 states and 3 transitions', () => {
    const { steps } = buildThompsonSteps('ab')
    const nfa = steps.at(-1)!.nfaAfter
    expect(nfa.states).toHaveLength(4)
    expect(nfa.transitions).toHaveLength(3)
  })

  it('alphabet contains both "a" and "b"', () => {
    const { steps } = buildThompsonSteps('ab')
    const alpha = steps.at(-1)!.nfaAfter.alphabet
    expect(alpha).toContain('a')
    expect(alpha).toContain('b')
  })
})

// ---- Medium: Kleene star ----

describe('medium — Kleene star "a*"', () => {
  it('produces 2 steps: symbol a, then star', () => {
    const { steps } = buildThompsonSteps('a*')
    expect(steps).toHaveLength(2)
    expect(steps[0]!.template).toBe('symbol')
    expect(steps[1]!.template).toBe('star')
  })

  it('star step adds 1 new state (the loop state) and 2 ε-transitions', () => {
    const { steps } = buildThompsonSteps('a*')
    expect(steps[1]!.newStateIds).toHaveLength(1)
    expect(steps[1]!.newTransitionIds).toHaveLength(2)
  })

  it('star fragment start and final are the same state', () => {
    const { steps } = buildThompsonSteps('a*')
    expect(steps[1]!.fragmentStartId).toBe(steps[1]!.fragmentFinalId)
  })

  it('final NFA has 3 states and 3 transitions', () => {
    const { steps } = buildThompsonSteps('a*')
    const nfa = steps.at(-1)!.nfaAfter
    expect(nfa.states).toHaveLength(3)
    expect(nfa.transitions).toHaveLength(3)
  })
})

// ---- Hard: union ----

describe('hard — union "a+b"', () => {
  it('produces 3 steps: symbol a, symbol b, union', () => {
    const { steps } = buildThompsonSteps('a+b')
    expect(steps).toHaveLength(3)
    expect(steps[2]!.template).toBe('union')
  })

  it('union step covers the full expression', () => {
    const { steps } = buildThompsonSteps('a+b')
    expect(steps[2]!.subExpr).toBe('a+b')
  })

  it('union step adds 2 new states and 4 ε-transitions', () => {
    const { steps } = buildThompsonSteps('a+b')
    expect(steps[2]!.newStateIds).toHaveLength(2)
    expect(steps[2]!.newTransitionIds).toHaveLength(4)
  })

  it('final NFA has 6 states and 6 transitions', () => {
    const { steps } = buildThompsonSteps('a+b')
    const nfa = steps.at(-1)!.nfaAfter
    expect(nfa.states).toHaveLength(6)
    expect(nfa.transitions).toHaveLength(6)
  })

  it('all 4 union ε-transitions are labelled ε', () => {
    const { steps } = buildThompsonSteps('a+b')
    const unionStep = steps[2]!
    expect(unionStep.expectedTransitions.every(t => t.symbol === EPSILON)).toBe(true)
  })
})

// ---- Very Hard: nested — "(a+b)*c" ----

describe('very hard — "(a+b)*c"', () => {
  it('produces 6 steps in correct post-order: a, b, union, star, c, concat', () => {
    const { steps } = buildThompsonSteps('(a+b)*c')
    expect(steps).toHaveLength(6)
    expect(steps[0]!.template).toBe('symbol') // a
    expect(steps[1]!.template).toBe('symbol') // b
    expect(steps[2]!.template).toBe('union')  // a+b
    expect(steps[3]!.template).toBe('star')   // (a+b)*
    expect(steps[4]!.template).toBe('symbol') // c
    expect(steps[5]!.template).toBe('concat') // (a+b)*c
  })

  it('subExpr on each step matches the correct regex substring', () => {
    const { steps } = buildThompsonSteps('(a+b)*c')
    expect(steps[0]!.subExpr).toBe('a')
    expect(steps[1]!.subExpr).toBe('b')
    // The union node's range is extended to include the surrounding parens
    expect(steps[2]!.subExpr).toBe('(a+b)')
    expect(steps[3]!.subExpr).toBe('(a+b)*')
    expect(steps[4]!.subExpr).toBe('c')
    expect(steps[5]!.subExpr).toBe('(a+b)*c')
  })

  it('final NFA has 9 states and 10 transitions', () => {
    const { steps } = buildThompsonSteps('(a+b)*c')
    const nfa = steps.at(-1)!.nfaAfter
    expect(nfa.states).toHaveLength(9)
    expect(nfa.transitions).toHaveLength(10)
  })

  it('alphabet contains a, b, and c', () => {
    const { steps } = buildThompsonSteps('(a+b)*c')
    const alpha = steps.at(-1)!.nfaAfter.alphabet
    expect(alpha).toContain('a')
    expect(alpha).toContain('b')
    expect(alpha).toContain('c')
  })
})

// ---- Very Hard: pipe-style union and double star ----

describe('very hard — "a**" (double star is idempotent)', () => {
  it('parses without error', () => {
    const { error } = buildThompsonSteps('a**')
    expect(error).toBeUndefined()
  })

  it('the outer star wraps the inner star fragment — same start/final state throughout', () => {
    const { steps } = buildThompsonSteps('a**')
    expect(steps).toHaveLength(3)
    const outerStar = steps[2]!
    expect(outerStar.template).toBe('star')
    expect(outerStar.fragmentStartId).toBe(outerStar.fragmentFinalId)
  })
})
