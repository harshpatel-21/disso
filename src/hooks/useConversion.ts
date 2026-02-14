import { useCallback } from 'react'
import { useAppContext } from '../state/AppContext'
import type { StateId } from '../core/types'
import { nfaToGTG, cloneNFA } from '../core/nfa'
import {
  preprocess,
  computePathUpdates,
  applyElimination,
  extractFinalRegex,
  getEliminableStates,
} from '../core/stateElimination'

export function useConversion() {
  const { nfaState, nfaDispatch, conversionState, conversionDispatch } =
    useAppContext()

  const startConversion = useCallback(() => {
    const gtg = nfaToGTG(nfaState.nfa)
    conversionDispatch({ type: 'START_CONVERSION', payload: gtg })

    // Auto-preprocess
    const { gtg: preprocessed, step } = preprocess(gtg)
    conversionDispatch({
      type: 'PREPROCESS_COMPLETE',
      payload: { gtg: preprocessed, step },
    })

    // Switch to converting phase
    nfaDispatch({ type: 'SET_NFA_TO_REGEX_PHASE', payload: 'converting' })
  }, [nfaState.nfa, conversionDispatch, nfaDispatch])

  const selectStateToRemove = useCallback(
    (stateId: StateId) => {
      if (!conversionState.gtg) return
      conversionDispatch({
        type: 'SELECT_STATE_TO_REMOVE',
        payload: stateId,
      })
      const pathUpdates = computePathUpdates(conversionState.gtg, stateId)
      conversionDispatch({ type: 'SET_PATH_UPDATES', payload: pathUpdates })
    },
    [conversionState.gtg, conversionDispatch]
  )

  const submitAnswer = useCallback(
    (pathIndex: number, userInput: string) => {
      conversionDispatch({
        type: 'SUBMIT_PATH_ANSWER',
        payload: { pathIndex, userInput },
      })
    },
    [conversionDispatch]
  )

  const autoCompletePath = useCallback(
    (pathIndex: number) => {
      conversionDispatch({
        type: 'AUTO_COMPLETE_PATH',
        payload: pathIndex,
      })
    },
    [conversionDispatch]
  )

  const advancePath = useCallback(() => {
    conversionDispatch({ type: 'ADVANCE_PATH' })
  }, [conversionDispatch])

  const completeElimination = useCallback(() => {
    if (!conversionState.gtg || !conversionState.stateToRemove) return

    const stateId = conversionState.stateToRemove
    const before = cloneNFA(conversionState.gtg)
    const newGtg = applyElimination(
      conversionState.gtg,
      stateId,
      conversionState.currentPathUpdates
    )

    const removedState = conversionState.gtg.states.find(
      (s) => s.id === stateId
    )

    const step = {
      type: 'eliminate' as const,
      stateToRemove: stateId,
      affectedPaths: conversionState.currentPathUpdates,
      explanation: `Eliminated state ${removedState?.label ?? stateId}. Updated ${conversionState.currentPathUpdates.length} path(s).`,
      gtgBefore: before,
      gtgAfter: cloneNFA(newGtg),
    }

    // Check if only start and final remain
    const eliminable = getEliminableStates(newGtg)
    if (eliminable.length === 0) {
      conversionDispatch({
        type: 'COMPLETE_ELIMINATION',
        payload: { gtg: newGtg, step },
      })
      const regex = extractFinalRegex(newGtg)
      const extractStep = {
        type: 'extract' as const,
        affectedPaths: [],
        explanation: `Final regex: ${regex}`,
        gtgBefore: cloneNFA(newGtg),
        gtgAfter: cloneNFA(newGtg),
      }
      conversionDispatch({
        type: 'EXTRACT_RESULT',
        payload: { regex, step: extractStep },
      })
    } else {
      conversionDispatch({
        type: 'COMPLETE_ELIMINATION',
        payload: { gtg: newGtg, step },
      })
    }
  }, [conversionState, conversionDispatch])

  const goToStep = useCallback(
    (index: number) => {
      conversionDispatch({ type: 'GO_TO_STEP', payload: index })
    },
    [conversionDispatch]
  )

  const setHighlightedR = useCallback(
    (r: 'R1' | 'R2' | 'R3' | 'R4' | null) => {
      conversionDispatch({ type: 'SET_HIGHLIGHTED_R', payload: r })
    },
    [conversionDispatch]
  )

  const resetConversion = useCallback(() => {
    conversionDispatch({ type: 'RESET_CONVERSION' })
    nfaDispatch({ type: 'SET_NFA_TO_REGEX_PHASE', payload: 'input' })
  }, [conversionDispatch, nfaDispatch])

  const eliminableStates = conversionState.gtg
    ? getEliminableStates(conversionState.gtg)
    : []

  return {
    ...conversionState,
    eliminableStates,
    startConversion,
    selectStateToRemove,
    submitAnswer,
    autoCompletePath,
    advancePath,
    completeElimination,
    goToStep,
    setHighlightedR,
    resetConversion,
  }
}
