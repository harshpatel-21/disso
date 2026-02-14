import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from 'react'
import {
  nfaReducer,
  initialNFAState,
  type NFAState,
  type NFAAction,
} from './nfaReducer'
import {
  conversionReducer,
  initialConversionState,
  type ConversionState,
  type ConversionAction,
} from './conversionReducer'

interface AppContextType {
  nfaState: NFAState
  nfaDispatch: React.Dispatch<NFAAction>
  conversionState: ConversionState
  conversionDispatch: React.Dispatch<ConversionAction>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [nfaState, nfaDispatch] = useReducer(nfaReducer, initialNFAState)
  const [conversionState, conversionDispatch] = useReducer(
    conversionReducer,
    initialConversionState
  )

  const value = useMemo(
    () => ({ nfaState, nfaDispatch, conversionState, conversionDispatch }),
    [nfaState, conversionState]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return ctx
}
