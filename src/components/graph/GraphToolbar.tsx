/**
 * AI assistance was used for graph framework command integration in this file,
 * primarily wiring toolbar actions like fit-view behavior.
 */
import { useReactFlow } from '@xyflow/react'
import { Button } from '../common/Button'

export function GraphToolbar() {
  const { fitView } = useReactFlow()

  return (
    <div className="absolute top-3 right-3 z-10 flex gap-1">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
      >
        Fit View
      </Button>
    </div>
  )
}
