import { useConversion } from '../../hooks/useConversion'
import { Button } from './Button'

export function PlaybackControls() {
  const { history, currentStepIndex, goToStep } = useConversion()

  if (history.length === 0) return null

  return (
    <div className="flex items-center gap-2 border-t border-gray-200 pt-3">
      <Button
        size="sm"
        variant="ghost"
        disabled={currentStepIndex <= 0}
        onClick={() => goToStep(currentStepIndex - 1)}
      >
        ← Prev
      </Button>
      <span className="text-xs text-gray-500">
        Step {currentStepIndex + 1} / {history.length}
      </span>
      <Button
        size="sm"
        variant="ghost"
        disabled={currentStepIndex >= history.length - 1}
        onClick={() => goToStep(currentStepIndex + 1)}
      >
        Next →
      </Button>
    </div>
  )
}
