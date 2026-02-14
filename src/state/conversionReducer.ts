import type { GTG, EliminationStep, ConversionPhase } from '../core/types';

export interface ConversionState {
  phase: ConversionPhase;
  gtg: GTG | null;
  steps: EliminationStep[];
  currentStepIndex: number;
  selectedStateId: string | null;
  currentPathIndex: number;
  history: GTG[];
  finalRegex: string | null;
}

export const initialConversionState: ConversionState = {
  phase: 'idle',
  gtg: null,
  steps: [],
  currentStepIndex: -1,
  selectedStateId: null,
  currentPathIndex: 0,
  history: [],
  finalRegex: null,
};

export type ConversionAction =
  | { type: 'START_CONVERSION'; payload: { gtg: GTG } }
  | { type: 'SET_STEPS'; payload: { steps: EliminationStep[] } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: { index: number } }
  | { type: 'SELECT_STATE'; payload: { stateId: string } }
  | { type: 'SET_PATH_INDEX'; payload: { index: number } }
  | { type: 'UPDATE_USER_INPUT'; payload: { pathIndex: number; input: string } }
  | { type: 'SET_PHASE'; payload: { phase: ConversionPhase } }
  | { type: 'SET_FINAL_REGEX'; payload: { regex: string } }
  | { type: 'RESET' };

export function conversionReducer(state: ConversionState, action: ConversionAction): ConversionState {
  switch (action.type) {
    case 'START_CONVERSION':
      return {
        ...state,
        phase: 'preprocessing',
        gtg: action.payload.gtg,
        history: [action.payload.gtg],
        steps: [],
        currentStepIndex: -1,
        selectedStateId: null,
        currentPathIndex: 0,
        finalRegex: null,
      };

    case 'SET_STEPS':
      return { ...state, steps: action.payload.steps };

    case 'NEXT_STEP': {
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex >= state.steps.length) return state;
      const step = state.steps[nextIndex];
      const newHistory = [...state.history, step.gtgSnapshot];
      return {
        ...state,
        currentStepIndex: nextIndex,
        gtg: step.gtgSnapshot,
        history: newHistory,
        currentPathIndex: 0,
        phase: step.type === 'complete' ? 'complete' : step.type === 'preprocess' ? 'preprocessing' : 'eliminating',
        selectedStateId: step.stateToRemove ?? null,
        finalRegex: step.type === 'complete' ? extractFinalRegex(step) : state.finalRegex,
      };
    }

    case 'PREV_STEP': {
      if (state.currentStepIndex <= 0) return state;
      const prevIndex = state.currentStepIndex - 1;
      const step = state.steps[prevIndex];
      return {
        ...state,
        currentStepIndex: prevIndex,
        gtg: step.gtgSnapshot,
        currentPathIndex: 0,
        phase: step.type === 'complete' ? 'complete' : step.type === 'preprocess' ? 'preprocessing' : 'eliminating',
        selectedStateId: step.stateToRemove ?? null,
        finalRegex: null,
      };
    }

    case 'GO_TO_STEP': {
      const index = action.payload.index;
      if (index < 0 || index >= state.steps.length) return state;
      const step = state.steps[index];
      return {
        ...state,
        currentStepIndex: index,
        gtg: step.gtgSnapshot,
        currentPathIndex: 0,
        phase: step.type === 'complete' ? 'complete' : step.type === 'preprocess' ? 'preprocessing' : 'eliminating',
        selectedStateId: step.stateToRemove ?? null,
        finalRegex: step.type === 'complete' ? extractFinalRegex(step) : null,
      };
    }

    case 'SELECT_STATE':
      return { ...state, selectedStateId: action.payload.stateId };

    case 'SET_PATH_INDEX':
      return { ...state, currentPathIndex: action.payload.index };

    case 'UPDATE_USER_INPUT': {
      const steps = [...state.steps];
      const currentStep = { ...steps[state.currentStepIndex] };
      const paths = [...currentStep.affectedPaths];
      paths[action.payload.pathIndex] = {
        ...paths[action.payload.pathIndex],
        userInput: action.payload.input,
      };
      currentStep.affectedPaths = paths;
      steps[state.currentStepIndex] = currentStep;
      return { ...state, steps };
    }

    case 'SET_PHASE':
      return { ...state, phase: action.payload.phase };

    case 'SET_FINAL_REGEX':
      return { ...state, finalRegex: action.payload.regex };

    case 'RESET':
      return initialConversionState;

    default:
      return state;
  }
}

function extractFinalRegex(step: EliminationStep): string {
  // Extract regex from the explanation
  const match = step.explanation.match(/expression is: (.+)$/);
  return match ? match[1] : '∅';
}
