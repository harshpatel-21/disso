import { createContext, useContext, useReducer, useState, type ReactNode } from 'react';
import type { NFA, AppMode } from '../core/types';
import { nfaReducer, type NFAAction } from './nfaReducer';
import { conversionReducer, initialConversionState, type ConversionState, type ConversionAction } from './conversionReducer';
import { createEmptyNFA } from '../core/nfa';

interface AppState {
  mode: AppMode;
  nfa: NFA;
  conversion: ConversionState;
}

interface AppContextType {
  state: AppState;
  dispatch: {
    nfa: React.Dispatch<NFAAction>;
    conversion: React.Dispatch<ConversionAction>;
  };
  setMode: (mode: AppMode) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('input');
  const [nfa, nfaDispatch] = useReducer(nfaReducer, createEmptyNFA());
  const [conversion, conversionDispatch] = useReducer(conversionReducer, initialConversionState);

  const state: AppState = { mode, nfa, conversion };
  const dispatch = { nfa: nfaDispatch, conversion: conversionDispatch };

  return (
    <AppContext.Provider value={{ state, dispatch, setMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
