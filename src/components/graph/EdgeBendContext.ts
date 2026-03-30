import { createContext, useContext } from 'react'

interface EdgeBendContextValue {
  bends: Record<string, { x: number; y: number }>
  setEdgeBend: (id: string, x: number, y: number) => void
}

export const EdgeBendContext = createContext<EdgeBendContextValue>({
  bends: {},
  setEdgeBend: () => {},
})

export const useEdgeBendContext = () => useContext(EdgeBendContext)
