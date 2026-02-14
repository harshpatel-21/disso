import type { NFA, State, Transition } from '../core/types';
import { generateId } from '../core/nfa';

export type NFAAction =
  | { type: 'SET_NFA'; payload: NFA }
  | { type: 'ADD_STATE'; payload: { label: string; isStart: boolean; isFinal: boolean } }
  | { type: 'REMOVE_STATE'; payload: { stateId: string } }
  | { type: 'UPDATE_STATE'; payload: { stateId: string; updates: Partial<Pick<State, 'label' | 'isStart' | 'isFinal'>> } }
  | { type: 'ADD_TRANSITION'; payload: { source: string; target: string; symbol: string } }
  | { type: 'REMOVE_TRANSITION'; payload: { transitionId: string } }
  | { type: 'UPDATE_TRANSITION'; payload: { transitionId: string; updates: Partial<Pick<Transition, 'source' | 'target' | 'symbol'>> } }
  | { type: 'SET_ALPHABET'; payload: string[] }
  | { type: 'CLEAR' };

export function nfaReducer(state: NFA, action: NFAAction): NFA {
  switch (action.type) {
    case 'SET_NFA':
      return action.payload;

    case 'ADD_STATE': {
      const { label, isStart, isFinal } = action.payload;
      const states = isStart
        ? state.states.map(s => ({ ...s, isStart: false }))
        : [...state.states];
      const newState: State = { id: generateId(), label, isStart, isFinal };
      return { ...state, states: [...states, newState] };
    }

    case 'REMOVE_STATE': {
      const { stateId } = action.payload;
      return {
        ...state,
        states: state.states.filter(s => s.id !== stateId),
        transitions: state.transitions.filter(
          t => t.source !== stateId && t.target !== stateId
        ),
      };
    }

    case 'UPDATE_STATE': {
      const { stateId, updates } = action.payload;
      let states = state.states.map(s =>
        s.id === stateId ? { ...s, ...updates } : s
      );
      // If setting this state as start, clear others
      if (updates.isStart) {
        states = states.map(s =>
          s.id !== stateId ? { ...s, isStart: false } : s
        );
      }
      return { ...state, states };
    }

    case 'ADD_TRANSITION': {
      const { source, target, symbol } = action.payload;
      const newTransition: Transition = { id: generateId(), source, target, symbol };
      return { ...state, transitions: [...state.transitions, newTransition] };
    }

    case 'REMOVE_TRANSITION': {
      const { transitionId } = action.payload;
      return {
        ...state,
        transitions: state.transitions.filter(t => t.id !== transitionId),
      };
    }

    case 'UPDATE_TRANSITION': {
      const { transitionId, updates } = action.payload;
      return {
        ...state,
        transitions: state.transitions.map(t =>
          t.id === transitionId ? { ...t, ...updates } : t
        ),
      };
    }

    case 'SET_ALPHABET':
      return { ...state, alphabet: action.payload };

    case 'CLEAR':
      return { states: [], transitions: [], alphabet: [] };

    default:
      return state;
  }
}
