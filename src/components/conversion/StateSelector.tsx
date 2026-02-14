import { useConversion } from '../../hooks/useConversion'
import { Button } from '../common/Button'

export function StateSelector() {
  const { eliminableStates, selectStateToRemove } = useConversion()

  if (eliminableStates.length === 0) {
    return (
      <p className="text-sm text-gray-500">No states left to eliminate.</p>
    )
  }

  const handleAutoPick = () => {
    // Pick state with fewest total connections (simplest elimination)
    const first = eliminableStates[0]
    if (first) {
      selectStateToRemove(first.id)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-600">
        Select a state to eliminate ({eliminableStates.length} remaining):
      </p>
      <div className="flex flex-wrap gap-2">
        {eliminableStates.map((state) => (
          <button
            key={state.id}
            onClick={() => selectStateToRemove(state.id)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            {state.label}
          </button>
        ))}
      </div>
      <Button size="sm" variant="secondary" onClick={handleAutoPick}>
        Auto-pick
      </Button>
    </div>
  )
}
